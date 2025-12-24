
const mysql = require('mysql2/promise');

async function debug() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: '',
            database: 'F360DB'
        });
        console.log('Connected to F360DB');

        // 1. Check Configs
        console.log('\n--- Configurations ---');
        const [configs] = await connection.execute('SELECT * FROM google_sheet_config');
        console.table(configs);

        // 2. Check Audit Logs
        console.log('\n--- Audit Logs (Last 5) ---');
        const [logs] = await connection.execute('SELECT * FROM budget_data_change_log ORDER BY changed_at DESC LIMIT 5');
        console.table(logs);

        // 3. Check Sync Logs
        console.log('\n--- Sync Logs (Last 5) ---');
        const [syncLogs] = await connection.execute('SELECT * FROM google_sheet_sync_log ORDER BY sync_time DESC LIMIT 5');
        console.table(syncLogs);

        await connection.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}
debug();
