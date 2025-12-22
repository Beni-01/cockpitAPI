console.log('🚀 Debug script starting...');
import { google } from 'googleapis';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config();

const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'F360DB',
});

async function debugMapping() {
    await ds.initialize();

    console.log('🔍 DEBUGGING MAPPING ISSUE\n');

    // 1. Get Config and Mapping
    const configResult = await ds.query('SELECT * FROM google_sheet_config WHERE id = 6');
    const config = configResult[0];

    // Parse mapping if string (it might be since we are using raw query)
    let mapping = config.columnMapping;
    if (typeof mapping === 'string') {
        mapping = JSON.parse(mapping);
    }

    console.log('📋 Existing Mapping in DB:');
    console.log(mapping);

    // 2. Read Sheet Data (Simulate SheetReader)
    console.log('\n📄 Reading Sheet Data...');

    // Auth logic
    const keyFilePath = path.join(process.cwd(), 'config', 'google-service-account.json');
    const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.sheet_id,
        range: config.range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('❌ No data found in sheet');
        return;
    }

    const headers = rows[0];
    const firstRow = rows[1]; // Data row (assuming mapping starts from what data actually is)

    console.log('Headers from Sheet (Raw):', JSON.stringify(headers));
    console.log('First Data Row (Raw):', JSON.stringify(firstRow));

    // 3. Simulate SheetReader.readSheetWithHeaders logic
    const rowObject = {};
    headers.forEach((header, index) => {
        const cleanHeader = header ? String(header).trim() : '';
        if (cleanHeader) {
            rowObject[cleanHeader] = firstRow[index] || null;
        }
    });

    console.log('\n🧩 Constructed Row Object (what transformer sees):');
    console.log(rowObject);

    // 4. Test Transformation
    console.log('\n🔄 Testing Transformation:');

    for (const [sheetColumn, entityField] of Object.entries(mapping)) {
        const value = rowObject[sheetColumn];
        const exists = rowObject.hasOwnProperty(sheetColumn);
        console.log(`Mapping key: "${sheetColumn}" -> Exists in Row? ${exists} -> Value: "${value}" -> Target: ${entityField}`);

        if (value !== undefined && value !== null && value !== '') {
            console.log(`  ✅ WWOULD MAP: ${entityField} = ${value}`);
        } else {
            console.log(`  ❌ NO MAPPING HAPPENING for ${entityField}`);
        }
    }

    await ds.destroy();
}

debugMapping().catch(console.error);
