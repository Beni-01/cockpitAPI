const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
	const sqlPath = path.join(__dirname, 'populate_assigned_department.sql');
	if (!fs.existsSync(sqlPath)) {
		console.error('SQL file not found:', sqlPath);
		process.exit(1);
	}

	const sql = fs.readFileSync(sqlPath, 'utf8');

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || 'localhost',
		port: Number(process.env.DB_PORT) || 3306,
		user: process.env.DB_USER || process.env.DB_USERNAME || 'root',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_NAME || process.env.DB_DATABASE || 'f360db',
		multipleStatements: true,
	});

	try {
		console.log('Connected to DB. Running SQL file:', sqlPath);
		// execute whole script
		const [results] = await connection.query(sql);
		console.log('SQL executed. Results summary:');
		if (Array.isArray(results)) {
			console.log('Number of result sets:', results.length);
		} else {
			console.log(results);
		}
	} catch (err) {
		console.error('Error executing SQL file:', err.message || err);
		process.exitCode = 1;
	} finally {
		await connection.end();
	}
}

if (require.main === module) {
	run().catch((e) => {
		console.error(e);
		process.exit(1);
	});
}
