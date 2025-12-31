


import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const CSV_PATH_TACHES = path.join(__dirname, '..', 'data', 'budget', 'Master Budget - Cost Center.csv');

async function upsertGetId(conn: any, table: string, uniqueColumn: string, uniqueValue: string | null, extra: Record<string, any> = {}) {
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

function findHeaderIndex(lines: string[]) {
  for (let i = 0; i < Math.min(12, lines.length); i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('mapping cashflow') || lines[i].toLowerCase().includes('mapping_cash_flow')) return i;
  }
  return -1;
}



async function mainTaches() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Missing DB env vars. Set DB_HOST, DB_USER, DB_NAME');
    process.exit(1);
  }
  const port = DB_PORT ? Number(DB_PORT) : 3306;
  const conn = await mysql.createConnection({ host: DB_HOST, port, user: DB_USER, password: DB_PASSWORD || '', database: DB_NAME });
  try {
    const raw = fs.readFileSync(CSV_PATH_TACHES, 'utf8');
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

    const activityIdx = 3; // column D
    const sousIdx = 4; // column E
    const tacheIdx = 5; // column F
    const costIdx = headerRow.findIndex((h: string) => h.toLowerCase().includes('cost code') || h.toLowerCase().includes('cost_code') || h.toLowerCase().includes('cost'));

    let inserted = 0;
    let skipped = 0;

    for (const r of dataRows) {
      const activityNameRaw = (r[activityIdx] || '').toString().trim();
      const sousNameRaw = (r[sousIdx] || '').toString().trim();
      const tacheNameRaw = (r[tacheIdx] || '').toString().trim();
      const costCodeRaw = costIdx >= 0 ? (r[costIdx] || '').toString().trim() : '';
      const activityName = activityNameRaw;
      const sousName = sousNameRaw;
      const tacheName = tacheNameRaw;
      const costCode = costCodeRaw;
      if (!tacheName) { skipped++; continue; }

      // find or create parent activity by name only
      let activityId: number | null = null;
      if (activityName) {
        const [rowsA] = await conn.query('SELECT id FROM `budget_activity` WHERE `name` = ? LIMIT 1', [activityName]);
        // @ts-ignore
        if (rowsA.length > 0) activityId = rowsA[0].id;
      }
      if (!activityId && activityName) {
        activityId = await upsertGetId(conn, 'budget_activity', 'name', activityName || null);
      }

      // determine departmentId from activity if present
      let departmentId: number | null = null;
      if (activityId) {
        const [aRows] = await conn.query('SELECT department_id FROM `budget_activity` WHERE id = ? LIMIT 1', [activityId]);
        // @ts-ignore
        if (aRows && aRows.length > 0) {
          const d = aRows[0].department_id;
          if (d && d !== 0) departmentId = d;
        }
      }

      // find or create sous-activity by name+activity
      let sousId: number | null = null;
      if (sousName) {
        const [srows] = await conn.query('SELECT id FROM `budget_sous_activity` WHERE `name` = ? AND `activity_id` = ? LIMIT 1', [sousName, activityId]);
        // @ts-ignore
        if (srows.length > 0) sousId = srows[0].id;
      }
      if (!sousId && sousName) {
        const cols = ['name', 'activity_id'];
        const vals = [sousName || null, activityId];
        const placeholders = vals.map(() => '?').join(',');
        const [res] = await conn.query(`INSERT INTO ` + '`budget_sous_activity` (' + cols.map(c => `\`${c}\``).join(',') + `) VALUES (${placeholders})`, vals);
        // @ts-ignore
        sousId = res.insertId;
      }

      // now upsert tache by name + sous
      const [trows] = await conn.query('SELECT id, cost_code, activity_id, department_id FROM `budget_tache` WHERE `name` = ? AND `sous_activity_id` = ? LIMIT 1', [tacheName, sousId]);
      // @ts-ignore
      if (trows.length > 0) {
        // update cost_code if missing or different
        const tid = trows[0].id;
        const existingCost = trows[0].cost_code;
        const existingActivityId = trows[0].activity_id;
        const existingDeptId = trows[0].department_id;
        if (costCode && existingCost !== costCode) {
          await conn.query('UPDATE `budget_tache` SET `cost_code` = ? WHERE id = ?', [costCode || null, tid]);
        }
        if (activityId && (!existingActivityId || existingActivityId === 0)) {
          await conn.query('UPDATE `budget_tache` SET `activity_id` = ? WHERE id = ?', [activityId, tid]);
        }
        if (departmentId && (!existingDeptId || existingDeptId === 0)) {
          await conn.query('UPDATE `budget_tache` SET `department_id` = ? WHERE id = ?', [departmentId, tid]);
        }
      } else {
        const cols = ['name', 'sous_activity_id', 'cost_code'];
        const vals: any[] = [tacheName || null, sousId, costCode || null];
        if (activityId) {
          cols.push('activity_id');
          vals.push(activityId);
        }
        if (departmentId) {
          cols.push('department_id');
          vals.push(departmentId);
        }
        const placeholders = vals.map(() => '?').join(',');
        await conn.query(`INSERT INTO ` + '`budget_tache` (' + cols.map(c => `\`${c}\``).join(',') + `) VALUES (${placeholders})`, vals);
        inserted++;
      }
    }

    console.log('Inserted budget_tache rows:', inserted);
    console.log('Skipped rows (no tache name):', skipped);
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  } finally {
    await conn.end();
  }
}

if (require.main === module) mainTaches().catch((e: any) => { console.error(e); process.exit(4); });
