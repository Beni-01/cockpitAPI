const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
import mysql from 'mysql2/promise';
const dotenv = require('dotenv');

dotenv.config();

const CSV_PATH = path.join(__dirname, '..', 'data', 'budget', 'Master Budget - Cost Center.csv');

async function upsertGetActivtyId(conn: any, table: string, uniqueColumn: string, uniqueValue: string | null, extra: Record<string, any> = {}) {
  if (!uniqueValue) return null;
  const [rows] = await conn.query(`SELECT id FROM \`${table}\` WHERE \`${uniqueColumn}\` = ? LIMIT 1`, [uniqueValue]);
  // @ts-ignore
  if (rows.length > 0) return rows[0].id;
  const cols = [uniqueColumn, ...Object.keys(extra)];
  const vals = [uniqueValue, ...Object.values(extra)];
  const placeholders = vals.map(() => '?').join(',');
  const sql = `INSERT INTO \`${table}\` (${cols.map((c: string) => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
  const [res] = await conn.query(sql, vals);
  // @ts-ignore
  return res.insertId;
}

async function getTableColumns(conn: any, table: string) {
  try {
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    // @ts-ignore
    return (cols || []).map((c: any) => c.Field);
  } catch (e) {
    return [];
  }
}

function findHeaderIndex(lines: string[]) {
  for (let i = 0; i < Math.min(12, lines.length); i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  return -1;
}

export async function runAddBudgetActivities() {
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
    const headerIndex = findHeaderIndex(lines);
    if (headerIndex === -1) {
      console.error('Could not find CSV header row containing "Mapping CashFlow"');
      process.exit(2);
    }
    const csvText = lines.slice(headerIndex).join('\n');
    const rows = parse(csvText, { skip_empty_lines: true });
    if (!rows || rows.length < 2) {
      console.log('No data rows found after header');
      return;
    }

    const headerRow = rows[0].map((h: any) => (h || '').toString().trim());
    const dataRows = rows.slice(1);

    const mappingIdx = headerRow.findIndex((h: string) => h.toLowerCase().includes('mapping cashflow') || h.toLowerCase().includes('mapping_cash_flow'));
    const activityIdx = 3; // column D
    const deptIdx = 2; // column C (department name)

    const unique = new Map();
    for (const r of dataRows) {
      const mappingName = mappingIdx >= 0 ? (r[mappingIdx] || '').toString().trim() : '';
      const activityName = (r[activityIdx] || '').toString().trim();
      const deptName = deptIdx >= 0 ? (r[deptIdx] || '').toString().trim() : '';
      if (!activityName) continue;
      const key = `${mappingName}:::${activityName}`;
      if (!unique.has(key)) unique.set(key, { mappingName, activityName, deptName });
    }

    console.log('Unique activities to insert:', unique.size);

    // check for department_id presence in target tables
    const mappingCols = await getTableColumns(conn, 'mapping_cash_flow');
    const budgetActivityCols = await getTableColumns(conn, 'budget_activity');
    const hasMappingDepartment = mappingCols.includes('department_id');
    const hasBudgetDepartment = budgetActivityCols.includes('department_id');

    async function findDepartmentIdByName(conn: any, name: string | null) {
      if (!name) return null;
      const [rows] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [name]);
      // @ts-ignore
      if (rows && rows.length > 0) return rows[0].id;
      return null;
    }

    let inserted = 0;
    for (const [key, item] of unique.entries()) {
      const { mappingName, activityName, deptName } = item as any;
      // upsert mapping (attach department if present)
      let departmentId = null;
      if (deptName) {
        departmentId = await findDepartmentIdByName(conn, deptName || null);
      }
      // only include department_id when mapping_cash_flow actually has that column
      const mappingExtra: Record<string, any> = {};
      if (hasMappingDepartment && departmentId) mappingExtra['department_id'] = departmentId;
      const mappingId = await upsertGetActivtyId(conn, 'mapping_cash_flow', 'name', mappingName || null, mappingExtra);

      // upsert budget_activity by name
      const [existing] = await conn.query('SELECT id FROM `budget_activity` WHERE `name` = ? LIMIT 1', [activityName]);
      // @ts-ignore
      if (existing.length > 0) {
        const id = existing[0].id;
        if (hasBudgetDepartment) {
          await conn.query('UPDATE `budget_activity` SET `mapping_cash_flow_id` = ?, `department_id` = ? WHERE id = ?', [mappingId, departmentId, id]);
        } else {
          await conn.query('UPDATE `budget_activity` SET `mapping_cash_flow_id` = ? WHERE id = ?', [mappingId, id]);
        }
      } else {
        const extra: Record<string, any> = { mapping_cash_flow_id: mappingId };
        if (hasBudgetDepartment && departmentId) extra['department_id'] = departmentId;
        await upsertGetActivtyId(conn, 'budget_activity', 'name', activityName || null, extra);
        inserted++;
      }
    }

    console.log('Inserted new budget_activity rows:', inserted);
    // small reconciliation: propagate mapping->activity where missing
    if (hasBudgetDepartment && hasMappingDepartment) {
      const [res] = await conn.query(`UPDATE \`budget_activity\` ba JOIN \`mapping_cash_flow\` m ON ba.mapping_cash_flow_id = m.id SET ba.department_id = m.department_id WHERE (ba.department_id IS NULL OR ba.department_id = 0) AND m.department_id IS NOT NULL`);
      // @ts-ignore
      const reconciled = res && res.affectedRows ? res.affectedRows : 0;
      console.log('Reconciled department_id on budget_activity rows:', reconciled);
    } else {
      console.log('Skipping reconciliation: department_id not present on budget_activity or mapping_cash_flow');
    }

  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  } finally {
    await conn.end();
  }
}

if (require.main === module) runAddBudgetActivities().catch((e: any) => { console.error(e); process.exit(4); });
