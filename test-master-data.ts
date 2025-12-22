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

async function testMasterData() {
    await ds.initialize();

    console.log('🚀 TESTING MASTER DATA HIERARCHY\n');

    // 1. Get Departments
    console.log('📋 Level 1: Departments');
    const depts = await ds.query('SELECT DISTINCT department_name FROM budget_data WHERE config_id = 6 AND department_name IS NOT NULL');
    console.table(depts);

    if (depts.length > 0) {
        const dept = depts[0].department_name;

        // 2. Get Activities for first Dept
        console.log(`\n📋 Level 2: Activities for "${dept}"`);
        const acts = await ds.query('SELECT DISTINCT project_name as name FROM budget_data WHERE config_id = 6 AND department_name = ?', [dept]);
        console.table(acts);

        if (acts.length > 0) {
            const act = acts[0].name;

            // 3. Get Sub Activities
            console.log(`\n📋 Level 3: Sub-Activities for "${act}"`);
            const subs = await ds.query('SELECT DISTINCT budget_category as name FROM budget_data WHERE config_id = 6 AND department_name = ? AND project_name = ?', [dept, act]);
            console.table(subs);

            if (subs.length > 0) {
                const sub = subs[0].name;

                // 4. Get Tasks
                console.log(`\n📋 Level 4: Tasks for "${sub}"`);
                const tasks = await ds.query('SELECT DISTINCT cost_center as name, allocated_amount FROM budget_data WHERE config_id = 6 AND department_name = ? AND project_name = ? AND budget_category = ?', [dept, act, sub]);
                console.table(tasks);
            }
        }
    }

    await ds.destroy();
}

testMasterData().catch(console.error);
