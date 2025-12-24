const mysql = require('mysql2/promise');

async function testMultipleMethods() {
    console.log('🔍 Testing MySQL connection with different methods...\n');

    const configs = [
        {
            name: 'Method 1: TCP with apiuser',
            config: {
                host: 'localhost',
                port: 3306,
                user: 'apiuser',
                password: 'api123456',
                database: 'master_api_db'
            }
        },
        {
            name: 'Method 2: 127.0.0.1 with apiuser',
            config: {
                host: '127.0.0.1',
                port: 3306,
                user: 'apiuser',
                password: 'api123456',
                database: 'master_api_db'
            }
        },
        {
            name: 'Method 3: Socket with apiuser',
            config: {
                socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
                user: 'apiuser',
                password: 'api123456',
                database: 'master_api_db'
            }
        },
        {
            name: 'Method 4: No database specified',
            config: {
                host: 'localhost',
                port: 3306,
                user: 'apiuser',
                password: 'api123456'
            }
        }
    ];

    for (const test of configs) {
        console.log(`Testing: ${test.name}`);
        try {
            const connection = await mysql.createConnection(test.config);
            console.log(`✅ SUCCESS with ${test.name}!\n`);

            // Try to query
            const [result] = await connection.query('SELECT 1 as test');
            console.log('Query test:', result);

            await connection.end();

            console.log('\n🎉 WORKING CONFIG:');
            console.log(JSON.stringify(test.config, null, 2));
            console.log('\n');
            return test.config;
        } catch (error) {
            console.log(`❌ Failed: ${error.message}\n`);
        }
    }

    console.log('❌ All methods failed!');
    console.log('\n💡 Try running this in phpMyAdmin SQL tab:');
    console.log('SELECT User, Host, plugin FROM mysql.user WHERE User = "apiuser";');
    console.log('\nThis will show us the authentication plugin being used.\n');
}

testMultipleMethods();
