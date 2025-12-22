const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('🔍 Testing MySQL connection...\n');

    // Test 1: No password (XAMPP default)
    console.log('Test 1: Trying with NO password (XAMPP default)...');
    try {
        const conn1 = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'master_api_db'
        });
        console.log('✅ SUCCESS! No password needed.');
        console.log('   Your .env is correct.\n');
        await conn1.end();
        return;
    } catch (err) {
        console.log('❌ Failed:', err.message);
    }

    // Test 2: Try common XAMPP passwords
    const commonPasswords = ['', 'root', 'password', 'mysql'];

    for (const pwd of commonPasswords) {
        if (pwd === '') continue; // Already tested

        console.log(`\nTest: Trying password "${pwd}"...`);
        try {
            const conn = await mysql.createConnection({
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: pwd,
                database: 'master_api_db'
            });
            console.log(`✅ SUCCESS! Password is: "${pwd}"`);
            console.log(`\n📝 Update your .env file:`);
            console.log(`   DB_PASSWORD=${pwd}\n`);
            await conn.end();
            return;
        } catch (err) {
            console.log(`❌ Failed with "${pwd}"`);
        }
    }

    console.log('\n❌ Could not connect with common passwords.');
    console.log('\n💡 Solutions:');
    console.log('   1. Check phpMyAdmin → User accounts → root');
    console.log('   2. Or reset MySQL root password in XAMPP');
    console.log('   3. Or create a new MySQL user in phpMyAdmin\n');
}

testConnection().catch(console.error);
