const mysql = require('mysql2/promise');
require('dotenv').config();
(async ()=>{
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars'); process.exit(1); }
  const port = DB_PORT ? Number(DB_PORT) : 3306;
  const conn = await mysql.createConnection({ host: DB_HOST, port, user: DB_USER, password: DB_PASSWORD || '', database: DB_NAME });
  try {
    const [rows] = await conn.query('SELECT id, cost_center, description_cc, department_id, activity_id, sous_activity_id, tache_id, total_budget_usd FROM `budget` ORDER BY id DESC LIMIT 5');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) { console.error(e && e.message ? e.message : e); }
  finally { await conn.end(); }
})();
