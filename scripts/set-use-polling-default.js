const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT,10) : 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'F360DB';

  console.log('Connecting to DB', { host, port, user, database });
  const conn = await mysql.createConnection({ host, port, user, password, database });
  try {
    const sql = `ALTER TABLE \`google_sheet_config\` MODIFY \`use_polling\` TINYINT(1) NOT NULL DEFAULT 0;`;
    console.log('Running:', sql);
    const [res] = await conn.query(sql);
    console.log('Result:', res);
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
