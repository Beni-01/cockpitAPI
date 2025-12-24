const mysql = require('mysql2/promise');

async function testDirect() {
    console.log('🔍 Testing direct connection to masterapi user...\n');

    // Test with the password from .env
    const password = 'masterapi123';

    console.log('Attempting connection with:');
    console.log(`  Host: localhost`);
    console.log(`  User: masterapi`);
    console.log(`  Password: ${password}`);
    console.log(`  Database: master_api_db\n`);

    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'masterapi',
            password: password,
            database: 'master_api_db'
        });

        console.log('✅ SUCCESS! Connection works!\n');

        const [result] = await connection.query('SELECT 1 as test');
        console.log('✅ Query test passed:', result);

        await connection.end();

        console.log('\n✅ Ready to import data!');
        console.log('\nRun: npm run import "./data/Master Budget.xlsx"\n');

    } catch (error) {
        console.log('❌ Connection failed!');
        console.log('Error:', error.message);
        console.log('\n💡 Possible issues:');
        console.log('   1. Password might be different');
        console.log('   2. User might not have correct privileges');
        console.log('   3. Try clicking "Edit privileges" on masterapi user in phpMyAdmin');
        console.log('   4. Make sure "ALL PRIVILEGES" is checked\n');
    }
}

testDirect();
