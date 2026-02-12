const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');
const mysql = require('mysql2/promise');

config();

async function main() {
  const fileArg = process.argv[2] || 'insert-transactions.sql';
  const filePath = path.isAbsolute(fileArg) ? fileArg : path.resolve(process.cwd(), fileArg);

  if (!fs.existsSync(filePath)) {
    console.error('SQL file not found:', filePath);
    process.exit(1);
  }

  let sql = fs.readFileSync(filePath, 'utf8');

  // Remove any leading USE statements since we provide the database in the connection
  sql = sql.replace(/^\s*USE\s+[^;]+;?/im, '').trim();

  if (!sql) {
    console.error('No SQL to execute after removing USE statements.');
    process.exit(1);
  }

  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3307,
    user: process.env.DB_USER || process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'F360DB',
    // Keep multipleStatements false by default; this SQL is typically a single statement.
  };

  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    console.log('Connected to DB:', connectionConfig.host + ':' + connectionConfig.port, 'db=', connectionConfig.database);

    const [result] = await conn.query(sql);

    console.log('SQL executed successfully. Result:');
    console.dir(result, { depth: 2 });
  } catch (err) {
    console.error('Error executing SQL:', err.message || err);
    process.exitCode = 2;
  } finally {
    if (conn) await conn.end();
  }
}

main();
