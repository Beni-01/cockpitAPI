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

ds.initialize().then(async () => {
    console.log('🔄 FIXING RANGE...');
    await ds.query("UPDATE google_sheet_config SET `range` = 'Conso P&L!A1:Z' WHERE id = 6");
    console.log('✅ Updated range to start from A1');
    await ds.destroy();
}).catch(err => console.error(err));
