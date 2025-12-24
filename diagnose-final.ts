import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'F360DB',
});

async function diagnose() {
    await ds.initialize();

    console.log('🔍 FINAL DIAGNOSIS\n');

    // Check config
    const config = await ds.query('SELECT id, name, worksheet_name, `range`, columnMapping FROM google_sheet_config WHERE id = 6');
    console.log('📋 Config #6:');
    console.log(JSON.stringify(config[0], null, 2));

    // Check data
    const count = await ds.query('SELECT COUNT(*) as count FROM budget_data WHERE config_id = 6');
    console.log(`\n📊 Records for config #6: ${count[0].count}`);

    const sample = await ds.query('SELECT id, project_name, external_id, allocated_amount, notes FROM budget_data WHERE config_id = 6 LIMIT 3');
    console.log('\n📝 Sample records:');
    console.table(sample);

    // Check if ANY data exists
    const anyData = await ds.query(`
    SELECT COUNT(*) as count FROM budget_data 
    WHERE config_id = 6 
    AND (project_name IS NOT NULL OR allocated_amount IS NOT NULL OR external_id IS NOT NULL)
  `);
    console.log(`\n✅ Records with actual data: ${anyData[0].count}`);

    await ds.destroy();
}

diagnose().catch(console.error);
