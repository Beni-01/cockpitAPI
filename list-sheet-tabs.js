
const { google } = require('googleapis');
const path = require('path');

const KEY_FILE = path.join(__dirname, 'config/google-service-account.json');
const SPREADSHEET_ID = '1Er_DGkQNJJMG7PF1kRcSdxGv_j52qhexWU31hmKOcKI';

async function listTabs() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const res = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        console.log(' Spreadsheet Title:', res.data.properties.title);
        console.log(' Available Tabs:');
        res.data.sheets.forEach(sheet => {
            console.log(` - "${sheet.properties.title}" (ID: ${sheet.properties.sheetId})`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listTabs();
