const { pool } = require('./src/config/database');

async function verifyData() {
    try {
        console.log('🔍 Verifying imported data...\n');

        // Get total count
        const [count] = await pool.query('SELECT COUNT(*) as total FROM master_data');
        console.log(`📊 Total records: ${count[0].total}\n`);

        // Get sample records
        const [samples] = await pool.query('SELECT * FROM master_data LIMIT 5');
        console.log('📋 Sample records:\n');
        samples.forEach((row, idx) => {
            console.log(`Record ${idx + 1}:`);
            console.log(`  Department: ${row.department}`);
            console.log(`  Activity: ${row.activity}`);
            console.log(`  Sub Activity: ${row.sub_activity}`);
            console.log(`  Task: ${row.task}`);
            console.log(`  Code Dept: ${row.column_f}`);
            console.log(`  Code Activity: ${row.column_g}`);
            console.log(`  Code Sub Activity: ${row.column_h}`);
            console.log(`  Code Task: ${row.column_i}`);
            console.log(`  Cost Code: ${row.column_j}`);
            console.log(`  Description: ${row.column_k}`);
            console.log('');
        });

        // Get unique departments
        const [depts] = await pool.query('SELECT DISTINCT department FROM master_data WHERE department IS NOT NULL AND department != "" ORDER BY department');
        console.log(`\n🏢 Unique Departments (${depts.length}):`);
        depts.forEach(d => console.log(`  - ${d.department}`));

        // Get unique activities
        const [acts] = await pool.query('SELECT DISTINCT activity FROM master_data WHERE activity IS NOT NULL AND activity != "" ORDER BY activity LIMIT 10');
        console.log(`\n📌 Sample Activities (showing 10):`);
        acts.forEach(a => console.log(`  - ${a.activity}`));

        await pool.end();
        console.log('\n✅ Data verification complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyData();
