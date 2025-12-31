const mysql = require('mysql2/promise');
require('dotenv').config();

// Usage:
//   node scripts/update-tache-activity-deptid.js      # dry-run
//   node scripts/update-tache-activity-deptid.js --apply

const APPLY = process.argv.includes('--apply');
const BATCH = Number(process.env.BATCH_SIZE) || 500;

(async ()=>{
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
    console.log(`Scanning budget_tache rows (batch=${BATCH}) dry-run=${!APPLY}`);
    let lastId = 0;
    let inspected = 0, updated = 0, skipped = 0;
    while (true) {
      const [rows] = await conn.query('SELECT id, sous_activity_id, activity_id, department_id FROM `budget_tache` WHERE id > ? ORDER BY id ASC LIMIT ?', [lastId, BATCH]);
      if (!rows || rows.length === 0) break;
      for (const r of rows) {
        lastId = r.id;
        inspected++;
        const sousId = r.sous_activity_id;
        if (!sousId) { skipped++; continue; }
        // If both already set, skip
        const alreadyActivity = r.activity_id && Number(r.activity_id) > 0;
        const alreadyDept = r.department_id && Number(r.department_id) > 0;
        if (alreadyActivity && alreadyDept) { skipped++; continue; }
        const [srows] = await conn.query('SELECT activity_id, department_id FROM `budget_sous_activity` WHERE id = ? LIMIT 1', [sousId]);
        if (!srows || srows.length === 0) { skipped++; continue; }
        const sous = srows[0];
        const newActivity = sous.activity_id || null;
        const newDept = sous.department_id || null;
        if (!newActivity && !newDept) { skipped++; continue; }
        console.log(`tache id=${r.id}: sous=${sousId} -> activity=${newActivity} dept=${newDept}`);
        if (APPLY) {
          const sets = [];
          const vals = [];
          if (!alreadyActivity && newActivity) { sets.push('activity_id = ?'); vals.push(newActivity); }
          if (!alreadyDept && newDept) { sets.push('department_id = ?'); vals.push(newDept); }
          if (sets.length) {
            vals.push(r.id);
            await conn.query(`UPDATE ` + '`budget_tache`' + ` SET ${sets.join(', ')} WHERE id = ?`, vals);
            updated++;
          }
        }
      }
      if (rows.length < BATCH) break;
    }
    console.log(`Done. inspected=${inspected} updated=${updated} skipped=${skipped}`);
    if (!APPLY) console.log('Dry-run complete. Rerun with --apply to perform updates.');
  } catch (e) { console.error(e && e.message ? e.message : e); }
  finally { try { await conn.end(); } catch(_){} }
})();
