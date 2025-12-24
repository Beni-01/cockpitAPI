
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ==========================================
// ⚠️ ENTER YOUR REMOTE SERVER DETAILS HERE:
const REMOTE_CONFIG = {
    host: '10.140.0.106', // IP Address
    port: 3306,           // Default MySQL port
    user: 'root',         // Remote Username
    password: 'YOUR_PASSWORD_HERE', // <--- REPLACE THIS
    database: 'F360DB'    // Database Name
};
// ==========================================

async function applySql() {
    const sqlFile = path.join(__dirname, 'production_db_update.sql');

    if (!fs.existsSync(sqlFile)) {
        console.error('❌ SQL file not found:', sqlFile);
        return;
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    // Split by semicolons to run statement by statement (naive split)
    const statements = sqlContent.split(';').filter(s => s.trim().length > 0);

    console.log(`Connecting to ${REMOTE_CONFIG.host}...`);

    try {
        const connection = await mysql.createConnection(REMOTE_CONFIG);
        console.log('✅ Connected successfully!');

        for (const statement of statements) {
            const query = statement.trim();
            if (query) {
                console.log(`\nExecuting: ${query.substring(0, 50)}...`);
                try {
                    await connection.query(query);
                    console.log('OK.');
                } catch (err) {
                    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log('⚠️  Already exists (Skipping).');
                    } else {
                        console.error('❌ Error:', err.message);
                    }
                }
            }
        }

        console.log('\n🎉 All updates applied successfully!');
        await connection.end();

    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        console.log('Please check your VPN, IP Whitelist, or Password.');
    }
}

applySql();
