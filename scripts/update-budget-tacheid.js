const mysql = require('mysql2/promise');
require('dotenv').config();

const APPLY = process.argv.includes('--apply');

(async ()=>{
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
    // detect which table to operate on
    let table = null;
    const [t1] = await conn.query("SHOW COLUMNS FROM `budget` LIKE 'tache_id'");
    if (t1 && t1.length) table = 'budget';
    else {
      const [t2] = await conn.query("SHOW COLUMNS FROM `budget_data` LIKE 'tache_id'");
      if (t2 && t2.length) table = 'budget_data';
    }
    if (!table) { console.error('Neither `budget` nor `budget_data` contain `tache_id` column.'); process.exit(2); }

    console.log(`Operating on table: ${table} (dry-run=${!APPLY})`);
    const q = `SELECT id, cost_center FROM \`${table}\` WHERE (tache_id IS NULL OR tache_id = 0) AND cost_center IS NOT NULL AND cost_center <> ""`;
    const [rows] = await conn.query(q);
    console.log('Found', rows.length, 'candidate rows');
    let updated = 0, skipped = 0;
    for (let i=0;i<rows.length;i++){
      const r = rows[i];
      const cost = (r.cost_center || '').toString().trim();
      if (!cost) { skipped++; continue; }
      // try match by cost_code first
      const [trows] = await conn.query('SELECT id FROM `budget_tache` WHERE `cost_code` = ? LIMIT 1', [cost]);
      let tacheId = null;
      if (trows && trows.length) tacheId = trows[0].id;
      else {
        // fallback: try name match
        const [trows2] = await conn.query('SELECT id FROM `budget_tache` WHERE `name` = ? LIMIT 1', [cost]);
        if (trows2 && trows2.length) tacheId = trows2[0].id;
      }
      if (tacheId) {
        console.log(`Row id=${r.id}: will set tache_id=${tacheId} (cost='${cost}')`);
        if (APPLY) {
          await conn.query(`UPDATE \`${table}\` SET \`tache_id\` = ? WHERE id = ?`, [tacheId, r.id]);
          updated++;
        }
      } else {
        skipped++;
      }
      if ((i+1) % 200 === 0) console.log(`Processed ${i+1}/${rows.length} rows (updated=${updated})`);
    }
    console.log('Done. Updated:', updated, 'Skipped (no match):', skipped);
    if (!APPLY) console.log('Run with --apply to perform updates');
  } catch (e) { console.error(e && e.message ? e.message : e); }
  finally { await conn.end(); }
})();
