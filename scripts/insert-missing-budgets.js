const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DIR = path.join(__dirname, '..', 'data', 'fin');
const FILE = (() => {
  const arg = process.argv.find(a => a.startsWith('--file='));
  if (arg) return arg.split('=')[1];
  return process.argv[2] || 'Fonarev_Budget_Direction Financière - Summary (1).csv';
})();
const DEPT_CODE = (() => {
  const arg = process.argv.find(a => a.startsWith('--dept-code='));
  if (arg) return arg.split('=')[1];
  return 'CX';
})();
const DRY = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

function normalizeHeader(h) {
  return (h || '').toString().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function detectColumns(header) {
  const map = {};
  header.forEach((h, idx) => {
    const n = normalizeHeader(h);
    if (!n) return;
    map[n] = idx;
  });
  return map;
}

function mapHeaderToBudgetColumn(normalized) {
  if (!normalized) return null;
  const n = normalized;
  // common mappings aligning with import-budget-summary detection
  if (n.includes('description') || n.includes('texte') || n.includes('libelle')) return 'description_cc';
  if (n === 'cost_center' || n.includes('cost_center') || n.includes('costcenter') || n.includes('centre_de_cout') || n.includes('centre') || n.includes('cost')) return 'cost_center';
  if (n.includes('unit') || n.includes('unite')) return 'unite_mesure';
  if (n.includes('unit_cost') || n.includes('cout_unitaire') || (n.includes('cout') && n.includes('unit'))) return 'cout_unitaire_usd';
  if (n.includes('total') && n.includes('unite')) return 'total_units';
  if (n.includes('total') && n.includes('budget')) return 'total_budget_usd';
  // months
  if (n.includes('jan')) return 'jan';
  if (n.includes('feb') || n.includes('fevr') || n.includes('fev')) return 'feb';
  if (n.includes('mar') && !n.includes('march')) return 'mar';
  if (n.includes('apr') || n.includes('avr')) return 'apr';
  if (n.includes('may') || n === 'mai') return 'may';
  if (n.includes('jun') || n.includes('juin')) return 'jun';
  if (n.includes('jul') || n.includes('juil')) return 'jul';
  if (n.includes('aug') || n.includes('aout')) return 'aug';
  if (n.includes('sep')) return 'sep';
  if (n.includes('oct')) return 'oct';
  if (n.includes('nov')) return 'nov';
  if (n.includes('dec') || n.includes('déc')) return 'dec';
  // fallback: if header already looks like a DB column name, return it
  if (n === 'mapping' || n.includes('mapping_cash_flow') || n.includes('mapping_cash')) return 'mapping_cash_flow_id';
  if (n === 'department' || n === 'departement' || n === 'department_id') return 'department_id';
  if (n === 'activity' || n.includes('activity') || n.includes('activite')) return null; // handled via upsert in future
  if (n === 'sous_activity' || n.includes('sous') || n.includes('sous_activity')) return null;
  if (n === 'tache' || n.includes('tache') || n.includes('task')) return null;
  // if it already looks like a DB column, return it (common columns like jan, feb)
  return n;
}

function normalizeNumber(s) {
  if (s == null) return null;
  let t = s.toString();
  t = t.replace(/\u202F/g, '');
  t = t.replace(/\s/g, '');
  t = t.replace(/,/g, '.');
  t = t.replace(/[^0-9.\-]/g, '');
  if (t === '' || t === '-' || isNaN(Number(t))) return null;
  return t;
}

async function upsertSimple(conn, table, nameCol, name) {
  if (!name) return null;
  const n = name.toString().trim();
  if (!n) return null;
  const [rows] = await conn.query(`SELECT id FROM \`${table}\` WHERE \`${nameCol}\` = ? LIMIT 1`, [n]);
  if (rows && rows.length) return rows[0].id;
  const [res] = await conn.query(`INSERT INTO \`${table}\` (\`${nameCol}\`) VALUES (?)`, [n]);
  return res.insertId;
}

(async function main(){
  if (VERBOSE) console.log('Using department code:', DEPT_CODE);
  const fp = path.join(DIR, FILE);
  if (!fs.existsSync(fp)) { console.error('File not found:', fp); process.exit(2); }

  const raw = fs.readFileSync(fp, 'utf8');
  const rows = parse(raw, { skip_empty_lines: true });
  if (!rows || rows.length < 2) { console.error('No rows'); process.exit(2); }

  // detect header
  let headerIndex = -1;
  for (let i=0;i<Math.min(40, rows.length);i++){ const row = rows[i]; if(!row) continue; const joined = row.map(c => (c||'').toString().toLowerCase()).join(' '); if (joined.includes('cost center') || joined.includes('description') || joined.includes('texte') || joined.includes('departement')) { headerIndex = i; break; }}
  const header = headerIndex>=0?rows[headerIndex]:rows[0];
  const map = detectColumns(header);
  if (VERBOSE) console.log('Detected headers:', header);
  if (VERBOSE) console.log('Normalized map (header -> index):', map);
  const dataRows = headerIndex>=0?rows.slice(headerIndex+1):rows.slice(1);

  const rowsToInsert = [];
  // Build rows as raw objects keyed by normalized header names
  const headerTokens = ['centre des couts', 'centre de couts', 'centres des couts', 'texte / libelle', 'texte_libelle', 'description cc', 'description_cc'];
  const normalizedHeaders = Object.keys(map); // normalized header -> index
  for (const r of dataRows) {
    const rowObj = {};
    for (const nh of normalizedHeaders) {
      const idx = map[nh];
      rowObj[nh] = r[idx] !== undefined ? (r[idx] || '').toString().trim() : null;
    }
    // require some description-like field
    const descCandidates = ['description_cc', 'description', 'texte_libelle', 'texte', 'libelle'];
    let descVal = null;
    for (const c of descCandidates) { if (rowObj[c]) { descVal = rowObj[c]; break; } }
    if (!descVal) continue;
    const dl = descVal.toLowerCase(); if (headerTokens.some(t => dl === t || dl.includes(t))) continue;
    rowsToInsert.push(rowObj);
  }

  console.log('Rows to insert from CSV (no dedup):', rowsToInsert.length);


  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(2); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
    // get budget table columns
    const [budgetColsRaw] = await conn.query('SHOW COLUMNS FROM `budget`');
    const budgetCols = (budgetColsRaw || []).map(c => c.Field);
      if (VERBOSE) {
        console.log('DB `budget` columns:', budgetCols.join(', '));
        // preview mapping from CSV headers to DB columns
        const preview = {};
        const normalizedHeaders = Object.keys(map);
        normalizedHeaders.forEach(nh => {
          const mapped = mapHeaderToBudgetColumn(nh);
          const colName = mapped && budgetCols.includes(mapped) ? mapped : (budgetCols.includes(nh) ? nh : null);
          preview[nh] = colName;
        });
        console.log('Header -> DB column preview:', preview);
        const expectedFields = ['cost_center','description_cc','department_id','mapping_cash_flow_id','activity_id','sous_activity_id','tache_id','total_budget_usd','jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        const missing = expectedFields.filter(f => !budgetCols.includes(f) && !Object.values(preview).includes(f));
        console.log('Expected budget fields missing (neither in DB nor mapped from CSV):', missing);
      }

    // get or create department id for provided code
    let deptId = null;
    try {
      const [drows] = await conn.query('SELECT id FROM `department` WHERE LOWER(`code`) = LOWER(?) LIMIT 1', [DEPT_CODE]);
      if (drows && drows.length) deptId = drows[0].id;
      else {
        const [ins] = await conn.query('INSERT INTO `department` (`code`, `name`) VALUES (?, ?)', [DEPT_CODE, DEPT_CODE]);
        deptId = ins.insertId;
        console.log('Created department', DEPT_CODE, 'id', deptId);
      }
    } catch (e) { console.error('Failed to resolve/create department:', e && e.message ? e.message : e); process.exit(3); }

    const toInsert = rowsToInsert;
    if (toInsert.length === 0) return;
    if (DRY) {
      console.log('Dry-run: printing INSERTs (first 50):');
      toInsert.slice(0,50).forEach(it => {
        // build columns/values that exist in DB
        const cols = [];
        const vals = [];
        Object.keys(it).forEach(nh => {
          // prefer mapped column name
          const mapped = mapHeaderToBudgetColumn(nh);
          const colName = mapped && budgetCols.includes(mapped) ? mapped : (budgetCols.includes(nh) ? nh : null);
          if (colName) { cols.push(colName); vals.push(it[nh]); }
        });
        // ensure department_id present
        if (!cols.includes('department_id')) { cols.push('department_id'); vals.push(deptId); }
        console.log(`INSERT INTO budget (${cols.join(',')}) VALUES (${vals.map(v => JSON.stringify(v)).join(',')});`);
      });
      return;
    }

    // perform inserts in transaction
    await conn.beginTransaction();
    try {
      async function findExistingBudget(costCenter, description, departmentId) {
        if (!description) return null;
        const where = [];
        const params = [];
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

      for (const it of toInsert) {
        const cols = [];
        const vals = [];
        for (const nh of Object.keys(it)) {
          const mapped = mapHeaderToBudgetColumn(nh);
          const colName = mapped && budgetCols.includes(mapped) ? mapped : (budgetCols.includes(nh) ? nh : null);
          if (!colName) continue;
          // handle special mapped columns
          if (colName === 'mapping_cash_flow_id') {
            let mid = null;
            if (!DRY && it[nh]) {
              try { mid = await upsertSimple(conn, 'mapping_cash_flow', 'name', it[nh]); } catch (e) { mid = null; }
            }
            cols.push('`mapping_cash_flow_id`');
            vals.push(mid);
            continue;
          }
          // numeric normalization for months, totals, unit cost
          if (['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec','total_units','total_budget_usd','cout_unitaire_usd'].includes(colName)) {
            cols.push('`' + colName + '`');
            vals.push(normalizeNumber(it[nh]));
            continue;
          }
          cols.push('`' + colName + '`');
          vals.push(it[nh] || null);
        }
        if (!cols.includes('`department_id`')) { cols.push('`department_id`'); vals.push(deptId); }
        if (cols.length === 0) continue;
        // Determine key values for upsert lookup
        const costCenterVal = (() => {
          const idx = Object.keys(it).find(k => mapHeaderToBudgetColumn(k) === 'cost_center' || k === 'cost_center');
          return idx ? (it[idx] || null) : null;
        })();
        const descVal = (() => {
          const idx = Object.keys(it).find(k => mapHeaderToBudgetColumn(k) === 'description_cc' || k === 'description_cc');
          return idx ? (it[idx] || null) : null;
        })();
        const existingId = await findExistingBudget(costCenterVal, descVal, deptId);
        if (existingId) {
          // build UPDATE
          const sets = cols.map(c => c + ' = ?');
          const sql = 'UPDATE `budget` SET ' + sets.join(',') + ' WHERE id = ?';
          try {
            await conn.query(sql, [...vals, existingId]);
          } catch (err) {
            console.error('Update error:', err && err.message ? err.message : err, 'SQL:', sql, 'vals:', vals.slice(0,10));
          }
        } else {
          const placeholders = vals.map(() => '?').join(',');
          const sql = 'INSERT INTO `budget` (' + cols.join(',') + ') VALUES (' + placeholders + ')';
          try {
            await conn.query(sql, vals);
          } catch (err) {
            console.error('Insert error:', err && err.message ? err.message : err, 'SQL:', sql, 'vals:', vals.slice(0,10));
          }
        }
      }
      await conn.commit();
      console.log('Inserted', toInsert.length, 'rows into `budget`.');
    } catch (e) {
      await conn.rollback();
      console.error('Insert transaction failed:', e && e.message ? e.message : e);
    }
  } finally { await conn.end(); }
})();
