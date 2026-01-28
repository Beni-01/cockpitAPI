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
  return null;
})();
const DRY = process.argv.includes('--dry-run');

function normalizeHeader(h) {
  return (h || '').toString().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function detectColumns(header) {
  const map = {};
  header.forEach((h, idx) => {
    const n = normalizeHeader(h);
    if (!n) return;
    if ((n.includes('cost_center') || n === 'cost_center' || n === 'costcenter' || n === 'centre_de_cout') && map.costCenter == null) map.costCenter = idx;
    if ((n.includes('description') || n.includes('texte') || n.includes('description_cc')) && map.description == null) map.description = idx;
  });
  return map;
}

(async function main(){
  if (!DEPT_CODE) { console.error('Provide department code via --dept-code=CX'); process.exit(2); }
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
  const dataRows = headerIndex>=0?rows.slice(headerIndex+1):rows.slice(1);

  const rowsToInsert = [];
  const headerTokens = ['centre des couts', 'centre de couts', 'centres des couts', 'texte / libelle', 'texte_libelle', 'description cc', 'description_cc'];
  for (const r of dataRows) {
    const desc = map.description!=null? (r[map.description]||'').toString().trim() : '';
    if (!desc) continue;
    const dl = desc.toLowerCase(); if (headerTokens.some(t=> dl===t || dl.includes(t))) continue;
    const cc = map.costCenter!=null? (r[map.costCenter]||'').toString().trim() : null;
    rowsToInsert.push({ description: desc, cost_center: cc });
  }

  console.log('Rows to insert from CSV (no dedup):', rowsToInsert.length);

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(2); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
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
      toInsert.slice(0,50).forEach(it => console.log(`INSERT INTO budget (cost_center, description_cc, department_id) VALUES (${JSON.stringify(it.cost_center)}, ${JSON.stringify(it.description)}, ${deptId});`));
      return;
    }

    // perform inserts in transaction
    await conn.beginTransaction();
    try {
      for (const it of toInsert) {
        await conn.query('INSERT INTO `budget` (`cost_center`, `description_cc`, `department_id`) VALUES (?, ?, ?)', [it.cost_center || null, it.description, deptId]);
      }
      await conn.commit();
      console.log('Inserted', toInsert.length, 'rows into `budget`.');
    } catch (e) {
      await conn.rollback();
      console.error('Insert transaction failed:', e && e.message ? e.message : e);
    }
  } finally { await conn.end(); }
})();
