const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const DIR = path.join(__dirname, '..', 'data', 'fin');
const FORCE = process.argv.includes('--force');
const DEPT_CODE = (() => {
  const arg = process.argv.find(a => a.startsWith('--dept-code='));
  if (arg) return arg.split('=')[1];
  return process.env.DEPARTMENT_CODE || null;
})();

function normalizeHeader(h: any) {
  return (h || '').toString()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeNumber(s: any) {
  if (s == null) return null;
  let t = s.toString();
  t = t.replace(/\u202F/g, '');
  t = t.replace(/\s/g, '');
  t = t.replace(/,/g, '.');
  t = t.replace(/[^0-9.\-]/g, '');
  if (t === '' || t === '-' || isNaN(Number(t))) return null;
  return t;
}

async function upsertSimple(conn: any, table: string, nameCol: string, name: string) {
  if (!name) return null;
  const n = name.toString().trim();
  if (!n) return null;
  const [rows] = await conn.query(`SELECT id FROM \`${table}\` WHERE \`${nameCol}\` = ? LIMIT 1`, [n]);
  if (rows && rows.length) return rows[0].id;
  const [res] = await conn.query(`INSERT INTO \`${table}\` (\`${nameCol}\`) VALUES (?)`, [n]);
  return res.insertId;
}

async function upsertActivity(conn: any, name: string) {
  return upsertSimple(conn, 'budget_activity', 'name', name);
}
async function upsertSousActivity(conn: any, activityId: number | null, name: string) {
  if (!name) return null;
  const n = name.toString().trim();
  if (!n) return null;
  if (activityId != null) {
    const [rows] = await conn.query('SELECT id FROM `budget_sous_activity` WHERE `name` = ? AND `activity_id` = ? LIMIT 1', [n, activityId]);
    if (rows && rows.length) return rows[0].id;
    const [res] = await conn.query('INSERT INTO `budget_sous_activity` (`name`, `activity_id`) VALUES (?, ?)', [n, activityId]);
    return res.insertId;
  }
  const [rows] = await conn.query('SELECT id FROM `budget_sous_activity` WHERE `name` = ? LIMIT 1', [n]);
  if (rows && rows.length) return rows[0].id;
  const [res] = await conn.query('INSERT INTO `budget_sous_activity` (`name`, `activity_id`) VALUES (?, NULL)', [n]);
  return res.insertId;
}
async function upsertTache(conn: any, sousId: number | null, name: string, costCode?: string) {
  if (!name) return null;
  const n = name.toString().trim();
  if (!n) return null;
  if (sousId != null) {
    const [rows] = await conn.query('SELECT id FROM `budget_tache` WHERE `name` = ? AND `sous_activity_id` = ? LIMIT 1', [n, sousId]);
    if (rows && rows.length) return rows[0].id;
    const [res] = await conn.query('INSERT INTO `budget_tache` (`name`, `sous_activity_id`, `cost_code`) VALUES (?, ?, ?)', [n, sousId, costCode || null]);
    return res.insertId;
  }
  const [rows] = await conn.query('SELECT id FROM `budget_tache` WHERE `name` = ? LIMIT 1', [n]);
  if (rows && rows.length) return rows[0].id;
  const [res] = await conn.query('INSERT INTO `budget_tache` (`name`, `sous_activity_id`, `cost_code`) VALUES (?, NULL, ?)', [n, costCode || null]);
  return res.insertId;
}

function detectColumns(header: any[]) {
  const map: any = {};
  header.forEach((h, idx) => {
    const n = normalizeHeader(h);
    if (!n) return;
    if (['department', 'departement'].includes(n) && map.department == null) map.department = idx;
    if ((n.includes('mapping') || n.includes('mapping_cash_flow')) && map.mapping == null) map.mapping = idx;
    if ((n.includes('cost_center') || n === 'cost_center' || n === 'costcenter' || n === 'centre_de_cout') && map.costCenter == null) map.costCenter = idx;
    if ((n.includes('description') || n.includes('texte') || n.includes('description_cc')) && map.description == null) map.description = idx;
    if ((n.includes('unit') || n.includes('unite')) && map.unit == null) map.unit = idx;
    if ((n.includes('cout') || n.includes('unit_cost') || n.includes('cout_unitaire')) && map.unitCost == null) map.unitCost = idx;
    if ((n.includes('code') && n.includes('depart')) && map.codeDepartment == null) map.codeDepartment = idx;
    if ((n.includes('code') && n.includes('activ')) && map.codeActivity == null) map.codeActivity = idx;
    if ((n.includes('code') && n.includes('sous')) && map.codeSousActivity == null) map.codeSousActivity = idx;
    if ((n.includes('code') && n.includes('tach')) && map.codeTache == null) map.codeTache = idx;
    if ((n.includes('tache') || n.includes('task')) && map.tache == null) map.tache = idx;
    if ((n.includes('total') && n.includes('unite')) && map.totalUnits == null) map.totalUnits = idx;
    if ((n.includes('total') && n.includes('budget')) && map.totalBudgetUsd == null) map.totalBudgetUsd = idx;

    // french month tokens
    const fr = { janv: 'jan', fevr: 'feb', mars: 'mar', avr: 'apr', mai: 'may', juin: 'jun', juil: 'jul', aout: 'aug', sept: 'sep', oct: 'oct', nov: 'nov', dec: 'dec' } as any;
    Object.keys(fr).forEach(k => { if (n.includes(k)) map[fr[k]] = idx; });
    const en = { jan: 'jan', feb: 'feb', mar: 'mar', apr: 'apr', may: 'may', jun: 'jun', jul: 'jul', aug: 'aug', sep: 'sep', oct: 'oct', nov: 'nov', dec: 'dec' } as any;
    Object.keys(en).forEach(k => { if (n.includes(k)) map[en[k]] = idx; });
  });
  return map;
}

async function processFile(conn: any, filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = parse(raw, { skip_empty_lines: true });
  if (!rows || rows.length < 2) return { processed: 0, inserted: 0 };

  // detect header row
  let headerIndex = -1;
  for (let i = 0; i < Math.min(40, rows.length); i++) {
    const row = rows[i];
    if (!row) continue;
    const joined = row.map((c: any) => (c || '').toString().toLowerCase()).join(' ');
    if (joined.includes('cost center') || joined.includes('cost_center') || joined.includes('description') || joined.includes('texte') || joined.includes('departement')) {
      headerIndex = i; break;
    }
  }
  const header = headerIndex >= 0 ? rows[headerIndex] : rows[0];
  const map = detectColumns(header);
  const dataRows = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows.slice(1);

  // If a global department code was provided, resolve/create it once and use for all rows
  let overrideDepartmentId: any = null;
  if (DEPT_CODE) {
    try {
      const [drows] = await conn.query('SELECT id FROM `department` WHERE LOWER(`code`) = LOWER(?) LIMIT 1', [DEPT_CODE]);
      if (drows && drows.length) overrideDepartmentId = drows[0].id;
      else {
        const [ins] = await conn.query('INSERT INTO `department` (`code`, `name`) VALUES (?, ?)', [DEPT_CODE, DEPT_CODE]);
        overrideDepartmentId = ins.insertId;
      }
    } catch (e) {
      console.error('Failed to resolve/create override department:', e && e.message ? e.message : e);
      overrideDepartmentId = null;
    }
  }

  let processed = 0; let inserted = 0;

  // preload budget columns
  const [budgetColsRaw] = await conn.query('SHOW COLUMNS FROM `budget`');
  const budgetCols = (budgetColsRaw || []).map((c: any) => c.Field);

  async function findExistingBudget(costCenter: any, description: any, departmentId: any) {
    if (!description) return null;
    const where: string[] = [];
    const params: any[] = [];
    if (costCenter) { where.push('cost_center = ?'); params.push(costCenter); }
    if (description) { where.push('description_cc = ?'); params.push(description); }
    if (departmentId) { where.push('department_id = ?'); params.push(departmentId); }
    if (where.length === 0) return null;
    const sql = 'SELECT id FROM `budget` WHERE ' + where.join(' AND ') + ' LIMIT 1';
    try {
      const [rows] = await conn.query(sql, params);
      if (rows && rows.length) return rows[0].id;
    } catch (e) {}
    return null;
  }

  function isNumericString(s: any) {
    if (s == null) return false;
    const t = normalizeNumber(s);
    return t != null && isFinite(Number(t));
  }

  function isHeaderLikeRow(row: any[]) {
    const numericCols: number[] = [];
    ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec','totalUnits','totalBudgetUsd','unitCost'].forEach(k => { if (map[k] != null) numericCols.push(map[k]); });
    if (numericCols.length === 0) return false;
    let numericCount = 0;
    for (const idx of numericCols) {
      const raw = row[idx] === undefined || row[idx] === null ? null : row[idx].toString().trim();
      if (isNumericString(raw)) numericCount++;
    }
    return numericCount === 0;
  }

  for (const r of dataRows) {
    if (!FORCE && isHeaderLikeRow(r)) { processed++; continue; }

    const deptName = map.department != null ? (r[map.department] || '').toString().trim() : null;
    const activityName = map.activity != null ? (r[map.activity] || '').toString().trim() : null;
    const sousName = map.sousActivity != null ? (r[map.sousActivity] || '').toString().trim() : null;
    const tacheName = map.tache != null ? (r[map.tache] || '').toString().trim() : null;
    const costCode = map.costCode != null ? (r[map.costCode] || '').toString().trim() : null;

    // department id -- use override if provided, otherwise try by name or code; require code to create
    const deptCode = map.codeDepartment != null ? (r[map.codeDepartment] || '').toString().trim() : null;
    let departmentId = overrideDepartmentId || null;
    if (!departmentId) {
      if (deptName) {
        const [drows] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [deptName]);
        if (drows && drows.length) departmentId = drows[0].id;
      }
      if (!departmentId && deptCode) {
        const [drows2] = await conn.query('SELECT id FROM `department` WHERE `code` = ? LIMIT 1', [deptCode]);
        if (drows2 && drows2.length) departmentId = drows2[0].id;
        else {
          const nameToInsert = deptName && deptName.length ? deptName : deptCode;
          const [ins] = await conn.query('INSERT INTO `department` (`code`, `name`) VALUES (?, ?)', [deptCode, nameToInsert]);
          departmentId = ins.insertId;
        }
      } else if (!departmentId && deptName && FORCE) {
        // when forcing, create a department even if code is missing by generating a slug code
        function slug(s: string) { return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0,50); }
        const genCode = slug(deptName) || ('dept_' + Math.floor(Math.random()*100000));
        const [drows3] = await conn.query('SELECT id FROM `department` WHERE `code` = ? LIMIT 1', [genCode]);
        if (drows3 && drows3.length) departmentId = drows3[0].id;
        else {
          const [ins2] = await conn.query('INSERT INTO `department` (`code`, `name`) VALUES (?, ?)', [genCode, deptName]);
          departmentId = ins2.insertId;
        }
      }
    }

    // mapping
    let mappingId = null;
    if (map.mapping != null) {
      const mappingName = (r[map.mapping] || '').toString().trim();
      if (mappingName) {
        mappingId = await upsertSimple(conn, 'mapping_cash_flow', 'name', mappingName);
        if (mappingId && departmentId) await conn.query('UPDATE `mapping_cash_flow` SET `department_id` = ? WHERE id = ? AND (department_id IS NULL OR department_id = 0)', [departmentId, mappingId]);
      }
    }

    // activity/sous/tache ids: only LOOKUP existing entries, do NOT create or update these tables from this script
    async function findExistingId(table: string, nameCol: string, name: string, extraWhere?: string, extraParams?: any[]) {
      if (!name) return null;
      const params: any[] = [name].concat(extraParams || []);
      const where = extraWhere ? (`\`${nameCol}\` = ? AND ${extraWhere}`) : (`\`${nameCol}\` = ?`);
      try {
        const [rows] = await conn.query(`SELECT id FROM \`${table}\` WHERE ${where} LIMIT 1`, params);
        if (rows && rows.length) return rows[0].id;
      } catch (e) {}
      return null;
    }

    let activityId = null; let sousId = null; let tacheId = null;
    if (activityName) activityId = await findExistingId('budget_activity', 'name', activityName, '`department_id` = ?', [departmentId]);
    if (sousName) {
      if (activityId) sousId = await findExistingId('budget_sous_activity', 'name', sousName, '`activity_id` = ? AND `department_id` = ?', [activityId,departmentId]);
      else sousId = await findExistingId('budget_sous_activity', 'name', sousName, '`department_id` = ?', [departmentId]);
    }
    if (tacheName) {
      if (sousId) tacheId = await findExistingId('budget_tache', 'name', tacheName, '`sous_activity_id` = ? AND `department_id` = ?', [sousId,departmentId]);
      else tacheId = await findExistingId('budget_tache', 'name', tacheName, '`department_id` = ?', [departmentId]);
    }

    // description must exist
    const descVal = map.description != null ? (r[map.description] || '').toString().trim() : null;
    if (!descVal) { processed++; continue; }
    // skip common header-like filler rows that appear in these CSVs
    const descLower = descVal.toLowerCase();
    const headerTokens = ['centre des couts', 'centre de couts', 'centres des couts', 'texte / libelle', 'texte_libelle', 'description cc', 'description_cc'];
    if (!FORCE && headerTokens.some(t => descLower === t || descLower.includes(t))) { processed++; continue; }

    // If some ids still missing, try parsing description: "Dept _ Activity _ Sous _ Tache"
    try {
      const parts = descVal.split('_').map((p: any) => p && p.toString().trim()).filter(Boolean);
      if ((!departmentId || !activityId || !sousId || !tacheId) && parts.length > 0) {
        if (!departmentId && parts[0]) {
          const [drows] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [parts[0]]);
          if (drows && drows.length) departmentId = drows[0].id;
        }
        if (!activityId && parts[1]) {
          activityId = await upsertActivity(conn, parts[1]);
        }
        if (!sousId && parts[2]) {
          const parentAct = activityId || null;
          sousId = await upsertSousActivity(conn, parentAct, parts[2]);
        }
        if (!tacheId && parts[3]) {
          const parentSous = sousId || null;
          tacheId = await upsertTache(conn, parentSous, parts[3], costCode);
        }
      }
    } catch (e) {}

    // build insert
    const cols: string[] = []; const vals: any[] = [];
    function push(name: string, val: any) { cols.push('`' + name + '`'); vals.push(val); }

    if (map.costCenter != null) push('cost_center', (r[map.costCenter] || null) || null);
    push('description_cc', descVal);
    if (map.unit != null) push('unite_mesure', (r[map.unit] || null) || null);
    if (map.unitCost != null) push('cout_unitaire_usd', normalizeNumber(r[map.unitCost]));

    ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].forEach(m => { if (map[m] != null) push(m, normalizeNumber(r[map[m]])); });
    if (map.totalUnits != null) push('total_units', normalizeNumber(r[map.totalUnits]));
    if (map.totalBudgetUsd != null) push('total_budget_usd', normalizeNumber(r[map.totalBudgetUsd]));

    if (departmentId != null) push('department_id', departmentId);
    if (mappingId != null) push('mapping_cash_flow_id', mappingId);
    if (activityId != null) push('activity_id', activityId);
    if (sousId != null) push('sous_activity_id', sousId);
    if (tacheId != null) push('tache_id', tacheId);

    if (cols.length === 0) { processed++; continue; }
      if (processed < 200) console.log('Prepared insert cols=', cols, 'vals=', vals.slice(0,24));

    try {
      // determine key values for upsert lookup
      const costCenterVal = map.costCenter != null ? (r[map.costCenter] || null) : null;
      const descKey = descVal || null;
      const existingId = await findExistingBudget(costCenterVal, descKey, departmentId);
      if (existingId) {
        // perform update but do NOT overwrite existing activity/sous/tache ids
        const skipCols = ['`activity_id`', '`sous_activity_id`', '`tache_id`'];
        const updateCols: string[] = [];
        const updateVals: any[] = [];
        for (let i = 0; i < cols.length; i++) {
          const c = cols[i];
          if (skipCols.includes(c)) continue;
          updateCols.push(c);
          updateVals.push(vals[i]);
        }
        if (updateCols.length > 0) {
          const sets = updateCols.map(c => c + ' = ?');
          const sql = `UPDATE ` + '`budget`' + ` SET ${sets.join(',')} WHERE id = ?`;
          try {
            await conn.query(sql, [...updateVals, existingId]);
            if (processed < 50) console.log('Updated id:', existingId);
          } catch (e) {
            console.error('Update error for row:', (e && e.message) ? e.message : e, 'SQL:', sql, 'vals:', updateVals.slice(0,24));
          }
        } else {
          if (processed < 50) console.log('Skipping update for id (no updatable cols):', existingId);
        }
      } else {
        const placeholders = cols.map(() => '?').join(',');
        const sql = `INSERT INTO ` + '`budget`' + ` (${cols.join(',')}) VALUES (${placeholders})`;
        if (processed < 50) console.log('Executing:', sql, vals.slice(0, 24));
        const [res] = await conn.query(sql, vals);
        if (processed < 50) console.log('Inserted id:', res && res.insertId);
        inserted++;
      }
    } catch (err) {
      console.error('Insert/Update error for row:', (err && err.message) ? err.message : err);
    }

    processed++;
  }

  return { processed, inserted };
}

export async function runImportBudgetSummary() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Missing DB env vars. Set DB_HOST, DB_USER, DB_NAME');
    process.exit(1);
  }
  const port = DB_PORT ? Number(DB_PORT) : 3306;
  const conn = await mysql.createConnection({ host: DB_HOST, port, user: DB_USER, password: DB_PASSWORD || '', database: DB_NAME });
  try {
    const files = fs.readdirSync(DIR).filter((f: string) => f.toLowerCase().endsWith('.csv'));
    let totalProcessed = 0; let totalInserted = 0;
    for (const f of files) {
      console.log('Processing', f);
      const res = await processFile(conn, path.join(DIR, f));
      totalProcessed += res.processed; totalInserted += res.inserted;
      console.log(`File ${f}: processed=${res.processed} inserted=${res.inserted}`);
    }
    console.log('Done. Total processed:', totalProcessed, 'Total inserted:', totalInserted);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}

if (require.main === module) runImportBudgetSummary().catch((e: any) => { console.error(e); process.exit(4); });
