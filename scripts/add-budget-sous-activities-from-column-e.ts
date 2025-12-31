
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
// const mysql = require('mysql2/promise');
import mysql from 'mysql2/promise';
const dotenv = require('dotenv');
dotenv.config();

const SOUS_ACTIVITY_CSV_PATH = path.join(__dirname, '..', 'data', 'budget', 'Master Budget - Cost Center.csv');

async function upsertSousActivityGetId(conn: any, table: string, uniqueColumn: string, uniqueValue: string | null, extra: Record<string, any> = {}) {
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

function findHeaderSousActivityIndex(lines: string[]) {
  for (let i = 0; i < Math.min(12, lines.length); i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  return -1;
}

async function mainSousActivity() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Missing DB env vars. Set DB_HOST, DB_USER, DB_NAME');
    process.exit(1);
  }
  const port = DB_PORT ? Number(DB_PORT) : 3306;
  const conn = await mysql.createConnection({ host: DB_HOST, port, user: DB_USER, password: DB_PASSWORD || '', database: DB_NAME });
  try {
    const raw = fs.readFileSync(SOUS_ACTIVITY_CSV_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);
    const headerIndex = findHeaderSousActivityIndex(lines);
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

    const activityIdx = 3; // column D
    const sousIdx = 4; // column E
    // we'll match only by name (no code checks)

    const deptIdx = 2; // column C (department name)

    let inserted = 0;
    let skipped = 0;
   
    for (const r of dataRows) {
      const activityNameRaw = (r[activityIdx] || '').toString().trim();
      const sousNameRaw = (r[sousIdx] || '').toString().trim();
      const deptNameRaw = (r[deptIdx] || '').toString().trim();
      const activityName = activityNameRaw;
      const sousName = sousNameRaw;
      if (!sousName) { skipped++; continue; }

      // find department id if available
      let departmentId: number | null = null;
      if (deptNameRaw) {
        const [drows] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [deptNameRaw]);
        // @ts-ignore
        if (drows && drows.length > 0) departmentId = drows[0].id;
      }

      // find or create parent activity by name only
      let activityId: number | null = null;
      if (activityName) {
        const [rowsA2] = await conn.query('SELECT id FROM `budget_activity` WHERE `name` = ? LIMIT 1', [activityName]);
        // @ts-ignore
        if (rowsA2.length > 0) activityId = rowsA2[0].id;
      }
      if (!activityId && activityName) {
        // create a minimal activity record so we can link sous-activity
        const extra: Record<string, any> = {};
        if (departmentId) extra['department_id'] = departmentId;
        activityId = await upsertSousActivityGetId(conn, 'budget_activity', 'name', activityName || null, extra);
      }

      // if we still don't have a departmentId, try to read it from the activity record
      if (!departmentId && activityId) {
        const [aDeptRows] = await conn.query('SELECT department_id FROM `budget_activity` WHERE id = ? LIMIT 1', [activityId]);
        // @ts-ignore
        if (aDeptRows && aDeptRows.length > 0) {
          const actDept = aDeptRows[0].department_id;
          if (actDept && actDept !== 0) departmentId = actDept;
        }
      }

      // if activity exists but has no department and we have one, update it
      if (activityId && departmentId) {
        const [aRows2] = await conn.query('SELECT department_id FROM `budget_activity` WHERE id = ? LIMIT 1', [activityId]);
        // @ts-ignore
        if (aRows2 && aRows2.length > 0) {
          const currentDept = aRows2[0].department_id;
          if (!currentDept || currentDept === 0) {
            await conn.query('UPDATE `budget_activity` SET `department_id` = ? WHERE id = ?', [departmentId, activityId]);
          }
        }
      }

      // now upsert sous-activity by name+activity only
      const [srows2] = await conn.query('SELECT id, department_id FROM `budget_sous_activity` WHERE `name` = ? AND `activity_id` = ? LIMIT 1', [sousName, activityId]);
      // @ts-ignore
      if (srows2.length > 0) {
        // already exists — but if department is missing and we have one, update it
        // @ts-ignore
        const existing = srows2[0];
        if (departmentId && (!existing.department_id || existing.department_id === 0)) {
          await conn.query('UPDATE `budget_sous_activity` SET `department_id` = ? WHERE id = ?', [departmentId, existing.id]);
        }
      } else {
        const cols = ['name', 'activity_id'];
        const vals: any[] = [sousName || null, activityId];
        if (departmentId) {
          cols.push('department_id');
          vals.push(departmentId);
        }
        const placeholders = vals.map(() => '?').join(',');
        await conn.query(`INSERT INTO ` + '`budget_sous_activity` (' + cols.map(c => `\`${c}\``).join(',') + `) VALUES (${placeholders})`, vals);
        inserted++;
      }
    }

    console.log('Inserted budget_sous_activity rows:', inserted);
    console.log('Skipped rows (no sous name):', skipped);
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  } finally {
    await conn.end();
  }
}

if (require.main === module) mainSousActivity().catch((e: any) => { console.error(e); process.exit(4); });
