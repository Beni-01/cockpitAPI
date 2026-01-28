const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');
require('dotenv').config();

const BUDGET_DIR = path.join(__dirname, '..', 'data', 'budget');
let CSV_PATH = path.join(BUDGET_DIR, 'Master Budget Apex - Cost Center.csv');
if (!fs.existsSync(CSV_PATH)) {
  const files = fs.readdirSync(BUDGET_DIR);
  const match = files.find(f => f.toLowerCase().includes('master budget apex') && f.toLowerCase().includes('cost center'));
  if (match) CSV_PATH = path.join(BUDGET_DIR, match);
}

function normalizeHeader(h) {
  return (h || '').toString()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function sniffDelimiterFromLine(line) {
  const l = (line || '').toString();
  const counts = [
    { d: ';', c: (l.match(/;/g) || []).length },
    { d: ',', c: (l.match(/,/g) || []).length },
    { d: '\t', c: (l.match(/\t/g) || []).length },
  ];
  counts.sort((a, b) => b.c - a.c);
  return counts[0].c > 0 ? counts[0].d : ',';
}

function detectIndexes(headerRow) {
  const header = (headerRow || []).map(h => normalizeHeader(h));

  const codeIdx = header.findIndex(n => n === 'code_tache' || (n.includes('code') && n.includes('tach')));
  const costCodeIdx = header.findIndex(n => n === 'cost_code' || n === 'costcode' || (n.includes('cost') && n.includes('code')));
  // optional: some files use Code Fonarev as a cost center-like identifier
  const costCenterIdx = header.findIndex(n => n === 'cost_center' || n === 'costcenter' || n === 'centre_de_cout' || n === 'code_fonarev');

  return { codeIdx, costCodeIdx, costCenterIdx, normalized: header };
}

function findHeaderIndex(lines) {
  for (let i = 0; i < Math.min(12, lines.length); i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  return -1;
}

async function upsertGetId(conn, table, uniqueColumn, uniqueValue, extra = {}) {
  if (!uniqueValue) return null;
  const [rows] = await conn.query(`SELECT id FROM \`${table}\` WHERE \`${uniqueColumn}\` = ? LIMIT 1`, [uniqueValue]);
  if (rows && rows.length > 0) return rows[0].id;
  const cols = [uniqueColumn, ...Object.keys(extra)];
  const vals = [uniqueValue, ...Object.values(extra)];
  const placeholders = vals.map(() => '?').join(',');
  const sql = `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
  const [res] = await conn.query(sql, vals);
  return res.insertId;
}

async function insertDepartments(conn, rows) {
  const nIdx = 2; // column C name
  const cIdx = 6; // column G code
  let inserted = 0, updated = 0;
  for (const r of rows) {
    const code = (r[cIdx] || '').toString().trim();
    const name = (r[nIdx] || '').toString().trim();
    if (!code && !name) continue;
    if (code) {
      if (code === "CX") {
        name = "Capex"
      }
      const [ex] = await conn.query('SELECT id, name FROM `department` WHERE `code` = ? LIMIT 1', [code]);
      if (ex && ex.length > 0) {
        if (name && name !== ex[0].name) {
          await conn.query('UPDATE `department` SET `name` = ? WHERE id = ?', [name, ex[0].id]);
          updated++;
        }
        continue;
      }
      await conn.query('INSERT INTO `department` (`code`, `name`) VALUES (?, ?)', [code || null, name || null]);
      inserted++;
    } else {
      const [byName] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [name]);
      if (byName && byName.length > 0) continue;
      await conn.query('INSERT INTO `department` (`name`) VALUES (?)', [name]);
      inserted++;
    }
  }
  console.log('Departments inserted:', inserted, 'updated:', updated);
}

async function addBudgetActivities(conn, rows) {
  const mappingIdx = 0; // mapping column (not always used)
  const activityIdx = 3; // D
  const deptIdx = 2; // C
  const unique = new Map();
  for (const r of rows) {
    const mappingName = (r[mappingIdx] || '').toString().trim();
    const activityName = (r[activityIdx] || '').toString().trim();
    const deptName = (r[deptIdx] || '').toString().trim();
    if (!activityName) continue;
    const key = `${mappingName}:::${activityName}`;
    if (!unique.has(key)) unique.set(key, { mappingName, activityName, deptName });
  }

  const mappingCols = await conn.query('SHOW COLUMNS FROM `mapping_cash_flow`').then(r => (r[0] || []).map(c => c.Field)).catch(() => []);
  const budgetActivityCols = await conn.query('SHOW COLUMNS FROM `budget_activity`').then(r => (r[0] || []).map(c => c.Field)).catch(() => []);
  const hasMappingDepartment = mappingCols.includes('department_id');
  const hasBudgetDepartment = budgetActivityCols.includes('department_id');

  async function findDepartmentIdByName(name) {
    if (!name) return null;
    const [rows] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [name]);
    if (rows && rows.length > 0) return rows[0].id;
    return null;
  }

  let inserted = 0;
  for (const item of unique.values()) {
    const mappingName = item.mappingName;
    const activityName = item.activityName;
    const deptName = item.deptName;
    let departmentId = null;
    if (deptName) departmentId = await findDepartmentIdByName(deptName);
    const mappingExtra = {};
    if (hasMappingDepartment && departmentId) mappingExtra['department_id'] = departmentId;
    const mappingId = await upsertGetId(conn, 'mapping_cash_flow', 'name', mappingName || null, mappingExtra);

    const [existing] = await conn.query('SELECT id FROM `budget_activity` WHERE `name` = ? LIMIT 1', [activityName]);
    if (existing && existing.length > 0) {
      const id = existing[0].id;
      if (hasBudgetDepartment) {
        await conn.query('UPDATE `budget_activity` SET `mapping_cash_flow_id` = ?, `department_id` = ? WHERE id = ?', [mappingId, departmentId, id]);
      } else {
        await conn.query('UPDATE `budget_activity` SET `mapping_cash_flow_id` = ? WHERE id = ?', [mappingId, id]);
      }
    } else {
      const extra = { mapping_cash_flow_id: mappingId };
      if (hasBudgetDepartment && departmentId) extra['department_id'] = departmentId;
      await upsertGetId(conn, 'budget_activity', 'name', activityName || null, extra);
      inserted++;
    }
  }
  console.log('Inserted budget_activity:', inserted);
}

async function addBudgetSousActivities(conn, rows) {
  const activityIdx = 3; // D
  const sousIdx = 4; // E
  const deptIdx = 2; // C
  let inserted = 0, skipped = 0;
  for (const r of rows) {
    const activityName = (r[activityIdx] || '').toString().trim();
    const sousName = (r[sousIdx] || '').toString().trim();
    const deptName = (r[deptIdx] || '').toString().trim();
    if (!sousName) { skipped++; continue; }

    let departmentId = null;
    if (deptName) {
      const [drows] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [deptName]);
      if (drows && drows.length > 0) departmentId = drows[0].id;
    }

    let activityId = null;
    if (activityName) {
      const [aRows] = await conn.query('SELECT id FROM `budget_activity` WHERE `name` = ? LIMIT 1', [activityName]);
      if (aRows && aRows.length > 0) activityId = aRows[0].id;
    }
    if (!activityId && activityName) {
      const extra = {};
      if (departmentId) extra['department_id'] = departmentId;
      activityId = await upsertGetId(conn, 'budget_activity', 'name', activityName || null, extra);
    }

    if (!departmentId && activityId) {
      const [aDeptRows] = await conn.query('SELECT department_id FROM `budget_activity` WHERE id = ? LIMIT 1', [activityId]);
      if (aDeptRows && aDeptRows.length > 0) {
        const actDept = aDeptRows[0].department_id;
        if (actDept && actDept !== 0) departmentId = actDept;
      }
    }

    if (activityId && departmentId) {
      const [aRows2] = await conn.query('SELECT department_id FROM `budget_activity` WHERE id = ? LIMIT 1', [activityId]);
      if (aRows2 && aRows2.length > 0) {
        const currentDept = aRows2[0].department_id;
        if (!currentDept || currentDept === 0) {
          await conn.query('UPDATE `budget_activity` SET `department_id` = ? WHERE id = ?', [departmentId, activityId]);
        }
      }
    }

    const [srows2] = await conn.query('SELECT id, department_id FROM `budget_sous_activity` WHERE `name` = ? AND `activity_id` = ? LIMIT 1', [sousName, activityId]);
    if (srows2 && srows2.length > 0) {
      const existing = srows2[0];
      if (departmentId && (!existing.department_id || existing.department_id === 0)) {
        await conn.query('UPDATE `budget_sous_activity` SET `department_id` = ? WHERE id = ?', [departmentId, existing.id]);
      }
    } else {
      const cols = ['name', 'activity_id'];
      const vals = [sousName || null, activityId];
      if (departmentId) { cols.push('department_id'); vals.push(departmentId); }
      const placeholders = vals.map(() => '?').join(',');
      await conn.query('INSERT INTO `budget_sous_activity` (' + cols.map(c => `\`${c}\``).join(',') + `) VALUES (${placeholders})`, vals);
      inserted++;
    }
  }
  console.log('Inserted budget_sous_activity:', inserted, 'Skipped (no sous):', skipped);
}

async function addBudgetTaches(conn, rows, idxs, hasCostCenterColumn) {
  const activityIdx = 3;
  const sousIdx = 4;
  const tacheIdx = 5;
  let inserted = 0, skipped = 0;
  for (const r of rows) {
    const activityName = (r[activityIdx] || '').toString().trim();
    const sousName = (r[sousIdx] || '').toString().trim();
    const tacheName = (r[tacheIdx] || '').toString().trim();
    const code = idxs && idxs.codeIdx >= 0 ? (r[idxs.codeIdx] || '').toString().trim() : '';
    const costCode = idxs && idxs.costCodeIdx >= 0 ? (r[idxs.costCodeIdx] || '').toString().trim() : '';
    const costCenter = idxs && idxs.costCenterIdx >= 0 ? (r[idxs.costCenterIdx] || '').toString().trim() : '';
    if (!tacheName) { skipped++; continue; }

    let activityId = null;
    if (activityName) {
      const [rowsA] = await conn.query('SELECT id FROM `budget_activity` WHERE `name` = ? LIMIT 1', [activityName]);
      if (rowsA && rowsA.length > 0) activityId = rowsA[0].id;
    }
    if (!activityId && activityName) activityId = await upsertGetId(conn, 'budget_activity', 'name', activityName || null);

    let departmentId = null;
    if (activityId) {
      const [aRows] = await conn.query('SELECT department_id FROM `budget_activity` WHERE id = ? LIMIT 1', [activityId]);
      if (aRows && aRows.length > 0) {
        const d = aRows[0].department_id;
        if (d && d !== 0) departmentId = d;
      }
    }

    let sousId = null;
    if (sousName) {
      const [srows] = await conn.query('SELECT id FROM `budget_sous_activity` WHERE `name` = ? AND `activity_id` = ? LIMIT 1', [sousName, activityId]);
      if (srows && srows.length > 0) sousId = srows[0].id;
    }
    if (!sousId && sousName) {
      const cols = ['name', 'activity_id'];
      const vals = [sousName || null, activityId];
      const placeholders = vals.map(() => '?').join(',');
      const [res] = await conn.query('INSERT INTO `budget_sous_activity` (' + cols.map(c => `\`${c}\``).join(',') + `) VALUES (${placeholders})`, vals);
      sousId = res.insertId;
    }

    const [trows] = await conn.query('SELECT id, code, cost_code, activity_id, department_id' + (hasCostCenterColumn ? ', cost_center' : '') + ' FROM `budget_tache` WHERE `name` = ? AND `sous_activity_id` = ? LIMIT 1', [tacheName, sousId]);
    if (trows && trows.length > 0) {
      const tid = trows[0].id;
      const existingActivityId = trows[0].activity_id;
      const existingDeptId = trows[0].department_id;
      const existingCode = trows[0].code;
      const existingCostCode = trows[0].cost_code;
      const existingCostCenter = hasCostCenterColumn ? trows[0].cost_center : null;
      if (activityId && (!existingActivityId || existingActivityId === 0)) {
        await conn.query('UPDATE `budget_tache` SET `activity_id` = ? WHERE id = ?', [activityId, tid]);
      }
      if (departmentId && (!existingDeptId || existingDeptId === 0)) {
        await conn.query('UPDATE `budget_tache` SET `department_id` = ? WHERE id = ?', [departmentId, tid]);
      }
      if (code && (!existingCode || existingCode === '')) {
        await conn.query('UPDATE `budget_tache` SET `code` = ? WHERE id = ? AND (`code` IS NULL OR `code` = \'\')', [code, tid]);
      }
      if (costCode && (existingCostCode !== costCode)) {
        await conn.query('UPDATE `budget_tache` SET `cost_code` = ? WHERE id = ?', [costCode, tid]);
      }
      if (hasCostCenterColumn && costCenter && (!existingCostCenter || existingCostCenter === '')) {
        await conn.query('UPDATE `budget_tache` SET `cost_center` = ? WHERE id = ? AND (`cost_center` IS NULL OR `cost_center` = \'\')', [costCenter, tid]);
      }
    } else {
      const cols = ['name', 'sous_activity_id'];
      const vals = [tacheName || null, sousId];
      if (activityId) { cols.push('activity_id'); vals.push(activityId); }
      if (departmentId) { cols.push('department_id'); vals.push(departmentId); }
      if (code) { cols.push('code'); vals.push(code); }
      if (costCode) { cols.push('cost_code'); vals.push(costCode); }
      if (hasCostCenterColumn && costCenter) { cols.push('cost_center'); vals.push(costCenter); }
      const placeholders = vals.map(() => '?').join(',');
      await conn.query('INSERT INTO `budget_tache` (' + cols.map(c => `\`${c}\``).join(',') + `) VALUES (${placeholders})`, vals);
      inserted++;
    }
  }
  console.log('Inserted budget_tache:', inserted, 'Skipped (no tache):', skipped);
}

async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Missing DB env vars. Set DB_HOST, DB_USER, DB_NAME');
    process.exit(1);
  }
  const port = DB_PORT ? Number(DB_PORT) : 3306;
  // use a pool to avoid connection reset during long imports
  const pool = mysql.createPool({ host: DB_HOST, port, user: DB_USER, password: DB_PASSWORD || '', database: DB_NAME, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
  const conn = pool;
  try {
    if (!fs.existsSync(CSV_PATH)) {
      console.error('CSV file not found:', CSV_PATH);
      process.exit(2);
    }
    const raw = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);
    const headerIndex = findHeaderIndex(lines);
    if (headerIndex === -1) {
      console.error('Could not find CSV header row containing "Mapping CashFlow"');
      process.exit(3);
    }
    // Fix a known header break in this export: "DESC\nRIPTION" -> "DESCRIPTION"
    const sliced = lines.slice(headerIndex);
    if (sliced.length >= 2) {
      const a = (sliced[0] || '').toString();
      const b = (sliced[1] || '').toString();
      if (/,\s*desc\s*$/i.test(a) && /^\s*ription\b/i.test(b)) {
        sliced[0] = a + b;
        sliced.splice(1, 1);
      }
    }

    const delimiter = sniffDelimiterFromLine(sliced[0]);
    const csvText = sliced.join('\n');
    const rows = parse(csvText, { skip_empty_lines: true, delimiter });
    if (!rows || rows.length < 2) {
      console.log('No data rows found after header');
      return;
    }
    const headerRow = rows[0];
    const dataRows = rows.slice(1);

    const idxs = detectIndexes(headerRow);
    console.log('Detected indexes:', {
      codeIdx: idxs.codeIdx,
      costCodeIdx: idxs.costCodeIdx,
      costCenterIdx: idxs.costCenterIdx,
    });
    if (idxs.costCodeIdx === -1) {
      console.warn('Warning: COST CODE column not detected. Normalized headers:', idxs.normalized.join(' | '));
    }

    const tacheCols = await conn.query('SHOW COLUMNS FROM `budget_tache`')
      .then(r => (r[0] || []).map(c => c.Field))
      .catch(() => []);
    const hasCostCenterColumn = tacheCols.includes('cost_center');
    if (hasCostCenterColumn && idxs.costCenterIdx === -1) {
      console.warn('Note: DB has budget_tache.cost_center but CSV column was not detected; cost_center will stay empty.');
    }

    console.log('Running imports using', CSV_PATH);
    await insertDepartments(conn, dataRows);
    await addBudgetActivities(conn, dataRows);
    await addBudgetSousActivities(conn, dataRows);
    await addBudgetTaches(conn, dataRows, idxs, hasCostCenterColumn);

  } catch (err) {
    console.error('Error:', err);
    process.exit(4);
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // ignore pool end errors
    }
  }
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(5); });
