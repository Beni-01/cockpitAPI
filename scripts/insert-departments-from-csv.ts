const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const CSV_PATH = path.join(__dirname, '..', 'data', 'budget', 'Master Budget - Cost Center.csv');

async function upsertDepartment(conn, code, name) {
  if (!code && !name) return null;
  // Prefer code as unique key; if missing, fallback to name
  if (code) {
    const [rows] = await conn.query('SELECT id, name FROM `department` WHERE `code` = ? LIMIT 1', [code]);
    if (rows.length > 0) {
      const existing = rows[0];
      if (name && name !== existing.name) {
        await conn.query('UPDATE `department` SET `name` = ? WHERE id = ?', [name, existing.id]);
      }
      return existing.id;
    }
    const [res] = await conn.query('INSERT INTO `department` (`code`, `name`) VALUES (?, ?)', [code, name || null]);
    return res.insertId;
  }

  // No code: try by name
  const [rowsByName] = await conn.query('SELECT id FROM `department` WHERE `name` = ? LIMIT 1', [name]);
  if (rowsByName.length > 0) return rowsByName[0].id;
  const [res2] = await conn.query('INSERT INTO `department` (`name`) VALUES (?)', [name]);
  return res2.insertId;
}

export async function runInsertDepartments() {
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
    const headerIndex = 0; // assume top row is header; other scripts detect header within first rows but csv usually has header
    const rows = parse(lines.slice(headerIndex).join('\n'), { skip_empty_lines: true });
    if (!rows || rows.length < 2) {
      console.log('No data rows found after header');
      return;
    }

    const headerRow = rows[0].map((h) => (h || '').toString().trim());
    const dataRows = rows.slice(1);

    // Use fixed columns: department name = column C (index 2), code = column G (index 6)
    const nIdx = 2; // column C
    const cIdx = 6; // column G

    let inserted = 0;
    let updated = 0;
    for (const r of dataRows) {
      const code = (r[cIdx] || '').toString().trim();
      const name = (r[nIdx] || '').toString().trim();
      if (!code && !name) continue;
      // check existing
      const [existing] = await conn.query('SELECT id, name FROM `department` WHERE `code` = ? LIMIT 1', [code || null]);
      if (existing && existing.length > 0) {
        const id = existing[0].id;
        if (name && name !== existing[0].name) {
          await conn.query('UPDATE `department` SET `name` = ? WHERE id = ?', [name, id]);
          updated++;
        }
      } else {
        await upsertDepartment(conn, code || null, name || null);
        inserted++;
      }
    }

    console.log('Inserted departments:', inserted, 'Updated:', updated);
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  } finally {
    await conn.end();
  }
}

if (require.main === module) runInsertDepartments().catch((e) => { console.error(e); process.exit(4); });
