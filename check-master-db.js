
const mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: '',
            database: 'master_api_db'
        });
        console.log('Connected to master_api_db!');

        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables:', rows);

        const [data] = await connection.execute('SELECT * FROM master_data LIMIT 1');
        console.log('Data sample:', data);

        await connection.end();
    } catch (e) {
        console.error('Connection failed:', e.message);
    }
}
check();
