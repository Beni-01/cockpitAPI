#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const fileArg = process.argv[2] || 'DB_Scripts/001-add-deleted_at-to-apex_input.sql';
  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error('SQL file not found:', filePath);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  // Support both MYSQL_* and DB_* env var names (many repo scripts use DB_*)
  const env = process.env;
  const MYSQL_HOST = env.MYSQL_HOST || env.DB_HOST || 'localhost';
  const MYSQL_PORT = env.MYSQL_PORT || env.DB_PORT || '3306';
  const MYSQL_USER = env.MYSQL_USER || env.DB_USER || env.DB_USER || 'root';
  const MYSQL_PASSWORD = env.MYSQL_PASSWORD || env.DB_PASSWORD || '';
  const MYSQL_DATABASE = env.MYSQL_DATABASE || env.MYSQL_DB || env.DB_NAME || env.DB_DATABASE;

  if (!MYSQL_DATABASE) {
    console.error('Environment variable MYSQL_DATABASE is required');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    multipleStatements: true,
  });

  try {
    console.log('Executing SQL file:', filePath);
    const [result] = await conn.query(sql);
    console.log('Execution result:', result);
    console.log('Done.');
  } catch (err) {
    console.error('Failed to execute SQL:', err.message || err);
    process.exitCode = 2;
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
