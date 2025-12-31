const mysql = require('mysql2/promise');
require('dotenv').config();

// Usage:
//   node scripts/update-sous-departmentid.js         # dry-run
//   node scripts/update-sous-departmentid.js --apply # apply updates
// Optional env: BATCH_SIZE

const APPLY = process.argv.includes('--apply');
const BATCH = Number(process.env.BATCH_SIZE) || 500;

(async ()=>{
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
    console.log(`Scanning budget_sous_activity rows (batch=${BATCH}) dry-run=${!APPLY}`);
    let lastId = 0;
    let inspected = 0, updated = 0, skipped = 0;
    while (true) {
      const [rows] = await conn.query('SELECT id, activity_id, department_id FROM `budget_sous_activity` WHERE id > ? ORDER BY id ASC LIMIT ?', [lastId, BATCH]);
      if (!rows || rows.length === 0) break;
      for (const r of rows) {
        lastId = r.id;
        inspected++;
        // if already set and non-zero, skip
        if (r.department_id && Number(r.department_id) > 0) { skipped++; continue; }
        const actId = r.activity_id;
        if (!actId) { skipped++; continue; }
        const [arows] = await conn.query('SELECT department_id FROM `budget_activity` WHERE id = ? LIMIT 1', [actId]);
        if (!arows || arows.length === 0) { skipped++; continue; }
        const deptId = arows[0].department_id || null;
        if (!deptId) { skipped++; continue; }
        console.log(`Row id=${r.id}: activity_id=${actId} -> department_id=${deptId}`);
        if (APPLY) {
          await conn.query('UPDATE `budget_sous_activity` SET department_id = ? WHERE id = ?', [deptId, r.id]);
          updated++;
        }
      }
      if (rows.length < BATCH) break;
    }
    console.log(`Done. inspected=${inspected} updated=${updated} skipped=${skipped}`);
    if (!APPLY) console.log('Dry-run complete. Rerun with --apply to perform updates.');
  } catch (e) { console.error(e && e.message ? e.message : e); }
  finally { try { await conn.end(); } catch(_){} }
})();
