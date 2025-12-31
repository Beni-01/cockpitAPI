const mysql = require('mysql2/promise');
require('dotenv').config();

const APPLY = process.argv.includes('--apply');

(async ()=>{
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
    console.log('Scanning `budget` rows with non-empty cost_center and a tache_id set...');
    const [rows] = await conn.query('SELECT id, cost_center, tache_id FROM `budget` WHERE cost_center IS NOT NULL AND cost_center <> "" AND tache_id IS NOT NULL');
    console.log('Found', rows.length, 'rows to inspect');
    let mismatches = 0, fixed = 0, unresolved = 0;
    for (let i=0;i<rows.length;i++){
      const r = rows[i];
      const cost = (r.cost_center || '').toString().trim();
      const currentTacheId = r.tache_id;
      // get current tache cost_code
      const [cur] = await conn.query('SELECT id, cost_code, name FROM `budget_tache` WHERE id = ? LIMIT 1', [currentTacheId]);
      const curTache = (cur && cur.length) ? cur[0] : null;
      const curCode = curTache ? (curTache.cost_code || '').toString().trim() : null;
      if (curCode === cost) continue; // matches, ok
      mismatches++;
      // try to find tache by cost_code
      const [foundByCode] = await conn.query('SELECT id FROM `budget_tache` WHERE `cost_code` = ? LIMIT 1', [cost]);
      let newTacheId = null;
      if (foundByCode && foundByCode.length) newTacheId = foundByCode[0].id;
      else {
        // fallback: try match by name
        const [foundByName] = await conn.query('SELECT id FROM `budget_tache` WHERE `name` = ? LIMIT 1', [cost]);
        if (foundByName && foundByName.length) newTacheId = foundByName[0].id;
      }
      if (newTacheId) {
        console.log(`Row id=${r.id}: cost='${cost}' currentTache=${currentTacheId} (code=${curCode}) -> will set tache_id=${newTacheId}`);
        if (APPLY) {
          await conn.query('UPDATE `budget` SET `tache_id` = ? WHERE id = ?', [newTacheId, r.id]);
          fixed++;
        }
      } else {
        console.log(`Row id=${r.id}: cost='${cost}' currentTache=${currentTacheId} (code=${curCode}) -> no matching tache found`);
        unresolved++;
      }
      if ((i+1) % 200 === 0) console.log(`Inspected ${i+1}/${rows.length} rows`);
    }
    console.log('Done. mismatches=', mismatches, 'fixed=', fixed, 'unresolved=', unresolved);
    if (!APPLY) console.log('Run with --apply to perform updates');
  } catch (e) { console.error(e && e.message ? e.message : e); }
  finally { await conn.end(); }
})();
