
const { google } = require('googleapis');
const path = require('path');

const KEY_FILE = path.join(__dirname, 'config/google-service-account.json');
const SPREADSHEET_ID = '1Er_DGkQNJJMG7PF1kRcSdxGv_j52qhexWU31hmKOcKI';

async function inspect(tabName) {
    console.log(`\n--- Inspecting Tab: "${tabName}" ---`);
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tabName}!A1:Z5`, // First 5 rows, A to Z
        });

        const rows = res.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found.');
            return;
        }

        rows.forEach((row, i) => {
            console.log(`Row ${i + 1}:`, JSON.stringify(row));
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function run() {
    await inspect('Cost Center');
}

run();
