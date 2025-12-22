const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing MySQL connection with current .env settings...\n');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Password: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);
    console.log(`Database: ${process.env.DB_NAME}\n`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ SUCCESS! Database connection works!\n');

        // Test if table exists
        const [tables] = await connection.query('SHOW TABLES');
        console.log('📊 Tables in database:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });

        // Check table structure
        const [columns] = await connection.query('DESCRIBE master_data');
        console.log('\n📋 Table structure:');
        columns.forEach(col => {
            console.log(`   - ${col.Field} (${col.Type})`);
        });

        // Check row count
        const [count] = await connection.query('SELECT COUNT(*) as count FROM master_data');
        console.log(`\n📈 Current row count: ${count[0].count}`);

        await connection.end();

        console.log('\n✅ Everything is ready for import!\n');
        return true;
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('\n💡 Make sure you created the MySQL user in phpMyAdmin:');
        console.log('   Username: masterapi');
        console.log('   Password: masterapi123');
        console.log('   Database: master_api_db\n');
        return false;
    }
}

testConnection();
