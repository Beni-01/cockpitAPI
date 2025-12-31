const mysql = require('mysql2/promise');
require('dotenv').config();

(async ()=>{
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
    console.log('Selecting apex_input rows with null tache_id and non-empty cost_center...');
    const [rows] = await conn.query('SELECT id, cost_center FROM `apex_input` WHERE (tache_id IS NULL OR tache_id = 0) AND cost_center IS NOT NULL AND cost_center <> ""');
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
        await conn.query('UPDATE `apex_input` SET `tache_id` = ? WHERE id = ?', [tacheId, r.id]);
        updated++;
      } else skipped++;
      if ((i+1) % 200 === 0) console.log(`Processed ${i+1}/${rows.length} rows (updated=${updated})`);
    }
    console.log('Done. Updated:', updated, 'Skipped (no match):', skipped);
  } catch (e) { console.error(e && e.message ? e.message : e); }
  finally { await conn.end(); }
})();
