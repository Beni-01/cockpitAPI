const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Usage:
//   node scripts/recheck-apex-tacheid.js         # dry-run
//   node scripts/recheck-apex-tacheid.js --apply # apply updates
// Optional env/args: BATCH_SIZE, LOG_FILE

const APPLY = process.argv.includes('--apply');
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 500;
const LOG_FILE = process.env.LOG_FILE || null; // e.g. ./logs/apex-recheck.log
const MAX_RETRIES = 5;

function logToFile(line) {
  if (!LOG_FILE) return;
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) { /* ignore */ }
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

async function createConn() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(1); }
  return mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
}

async function processBatch(conn, lastId) {
  const q = 'SELECT id, cost_center, tache_id FROM `apex_input` WHERE cost_center IS NOT NULL AND cost_center <> "" AND id > ? ORDER BY id ASC LIMIT ?';
  const [rows] = await conn.query(q, [lastId, BATCH_SIZE]);
  return rows;
}

async function findTacheIdForCost(conn, cost) {
  if (!cost) return null;
  const [byCode] = await conn.query('SELECT id FROM `budget_tache` WHERE `cost_code` = ? LIMIT 1', [cost]);
  if (byCode && byCode.length) return byCode[0].id;
  const [byName] = await conn.query('SELECT id FROM `budget_tache` WHERE `name` = ? LIMIT 1', [cost]);
  if (byName && byName.length) return byName[0].id;
  return null;
}

(async ()=>{
  let conn = await createConn();
  let lastId = Number(process.env.START_ID) || 0;
  let inspected = 0, mismatches = 0, fixed = 0, unresolved = 0;
  console.log(`Starting apex_input recheck (batch=${BATCH_SIZE}) dry-run=${!APPLY}`);
  logToFile(`START ${new Date().toISOString()} dry-run=${!APPLY} batch=${BATCH_SIZE}`);
  try {
    while (true) {
      let rows = null;
      let attempt = 0;
      while (attempt < MAX_RETRIES) {
        try { rows = await processBatch(conn, lastId); break; }
        catch (err) {
          attempt++;
          console.error('Batch query error:', err && err.message ? err.message : err);
          logToFile(`Batch query error: ${err && err.message ? err.message : err}`);
          try { await conn.end(); } catch(_){}
          await sleep(1000 * attempt);
          conn = await createConn();
        }
      }
      if (!rows || rows.length === 0) break;
      for (const r of rows) {
        inspected++;
        lastId = r.id;
        const cost = (r.cost_center || '').toString().trim();
        const curTacheId = r.tache_id || null;
        let curCode = null;
        try {
          if (curTacheId) {
            const [cur] = await conn.query('SELECT cost_code FROM `budget_tache` WHERE id = ? LIMIT 1', [curTacheId]);
            if (cur && cur.length) curCode = (cur[0].cost_code || '').toString().trim();
          }
        } catch (err) { console.error('Lookup current tache error', err && err.message ? err.message : err); }

        if (curCode === cost) continue; // already correct
        mismatches++;
        let newTacheId = null;
        try { newTacheId = await findTacheIdForCost(conn, cost); }
        catch (err) { console.error('Lookup budget_tache error', err && err.message ? err.message : err); }

        if (newTacheId) {
          const line = `apex id=${r.id} cost='${cost}' current=${curTacheId} -> set ${newTacheId}`;
          console.log(line);
          logToFile(line);
          if (APPLY) {
            try { await conn.query('UPDATE `apex_input` SET `tache_id` = ? WHERE id = ?', [newTacheId, r.id]); fixed++; }
            catch (err) { console.error('Update error', err && err.message ? err.message : err); logToFile(`Update error id=${r.id}: ${err && err.message ? err.message : err}`); }
          }
        } else {
          const line = `apex id=${r.id} cost='${cost}' current=${curTacheId} -> no match`;
          console.log(line);
          logToFile(line);
          unresolved++;
        }
      }
    }
    console.log(`Finished. inspected=${inspected} mismatches=${mismatches} fixed=${fixed} unresolved=${unresolved}`);
    logToFile(`END ${new Date().toISOString()} inspected=${inspected} mismatches=${mismatches} fixed=${fixed} unresolved=${unresolved}`);
    if (!APPLY) console.log('Dry-run complete. Rerun with --apply to perform updates.');
  } catch (err) {
    console.error('Fatal error:', err && err.message ? err.message : err);
    logToFile(`FATAL ${err && err.message ? err.message : err}`);
  } finally {
    try { await conn.end(); } catch(_){}
  }
})();
