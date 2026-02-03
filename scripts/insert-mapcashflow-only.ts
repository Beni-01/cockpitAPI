const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const CSV_PATH = path.join(__dirname, '..', 'data', 'budget', 'Master Budget - Cost Center.csv');

async function upsertMapCashflow(conn, name) {
  if (!name) return { id: null, created: false };
  const n = name.toString().trim();
  if (!n) return { id: null, created: false };
  // This function will be called with only name when used standalone.
  const [rows] = await conn.query('SELECT id FROM `mapping_cash_flow` WHERE `name` = ? LIMIT 1', [n]);
  if (rows && rows.length > 0) return { id: rows[0].id, created: false };
  const [res] = await conn.query('INSERT INTO `mapping_cash_flow` (`name`) VALUES (?)', [n]);
  return { id: res.insertId, created: true }
}

async function findDepartmentIdByName(conn, name) {
  if (!name) return null;
  const [rows] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [name]);
  if (rows && rows.length > 0) return rows[0].id;
  return null;
}

async function upsertMapCashflowWithDept(conn, name, deptId) {
  if (!name) return { id: null, created: false };
  const n = name.toString().trim();
  if (!n) return { id: null, created: false };

  if (deptId != null) {
    const [rows] = await conn.query('SELECT id FROM `mapping_cash_flow` WHERE `name` = ? AND `department_id` = ? LIMIT 1', [n, deptId]);
    if (rows && rows.length > 0) return { id: rows[0].id, created: false };
    const [res] = await conn.query('INSERT INTO `mapping_cash_flow` (`name`, `department_id`) VALUES (?, ?)', [n, deptId]);
    return { id: res.insertId, created: true };
  }

  // deptId is null => match rows where department_id IS NULL or 0
  const [rows] = await conn.query('SELECT id FROM `mapping_cash_flow` WHERE `name` = ? AND (department_id IS NULL OR department_id = 0) LIMIT 1', [n]);
  if (rows && rows.length > 0) return { id: rows[0].id, created: false };
  const [res] = await conn.query('INSERT INTO `mapping_cash_flow` (`name`, `department_id`) VALUES (?, NULL)', [n]);
  return { id: res.insertId, created: true };
}

export async function runInsertMapCashflow() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Missing DB env vars. Set DB_HOST, DB_USER, DB_NAME');
    process.exit(1);
  }

  const port = DB_PORT ? Number(DB_PORT) : 3306;
  const conn = await mysql.createConnection({ host: DB_HOST, port, user: DB_USER, password: DB_PASSWORD || '', database: DB_NAME });

  try {
    const raw = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);
    const rows = parse(lines.join('\n'), { skip_empty_lines: true });
    if (!rows || rows.length < 2) {
      console.log('No data rows found after header');
      return;
    }
    const dataRows = rows.slice(1);

    // mapping name = column B (index 1), department name = column C (index 2)
    const mappingIdx = 1;
    const deptIdx = 2;

    let processed = 0;
    let inserted = 0;
    for (const r of dataRows) {
      const mappingName = (r[mappingIdx] || '').toString().trim();
      const deptName = (r[deptIdx] || '').toString().trim();
      if (!mappingName) continue;
      const deptId = deptName ? await findDepartmentIdByName(conn, deptName) : null;
      const res = await upsertMapCashflowWithDept(conn, mappingName, deptId);
      if (res.created) inserted++;
      processed++;
      if (processed % 100 === 0) console.log('Processed', processed);
    }

    console.log('Processed rows:', processed, 'Inserted new mapping_cash_flow:', inserted);
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  } finally {
    await conn.end();
  }
}

if (require.main === module) runInsertMapCashflow().catch((e) => { console.error(e); process.exit(4); });
