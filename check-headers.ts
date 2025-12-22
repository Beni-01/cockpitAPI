import { google } from 'googleapis';
import * as fs from 'fs';
import { config } from 'dotenv';

config();

const serviceAccountKey = JSON.parse(
    fs.readFileSync('/Users/akash/Downloads/360App/F360API-client/google-sheet@adept-bond-481912-v6.iam.gserviceaccount.com.json', 'utf8')
);

const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function checkHeaders() {
    try {
        const sheets = google.sheets({ version: 'v4', auth });

        console.log('📊 Checking Conso P&L tab headers...\n');

        // Get first row (headers)
        const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: '1-AdB0YxaG9rJPtmS2aE09ckvcS_hRP7YUdqQoLAdZi4',
            range: 'Conso P&L!A1:Z1',
        });

        console.log('✅ Headers (Row 1):');
        if (headerResponse.data.values && headerResponse.data.values[0]) {
            headerResponse.data.values[0].forEach((header, index) => {
                const col = String.fromCharCode(65 + index);
                console.log(`  Column ${col}: "${header}"`);
            });
        } else {
            console.log('  No headers found in row 1');
        }

        // Get second row (first data row)
        console.log('\n📝 First Data Row (Row 2):');
        const dataResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: '1-AdB0YxaG9rJPtmS2aE09ckvcS_hRP7YUdqQoLAdZi4',
            range: 'Conso P&L!A2:J2',
        });

        if (dataResponse.data.values && dataResponse.data.values[0]) {
            dataResponse.data.values[0].forEach((value, index) => {
                const col = String.fromCharCode(65 + index);
                console.log(`  Column ${col}: "${value}"`);
            });
        }

        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkHeaders();
