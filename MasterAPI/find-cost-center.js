const XLSX = require('xlsx');

const filePath = './data/Master Budget.xlsx';
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: ''
});

console.log('🔍 Looking for table headers and data start...\n');

// Look for rows that might be headers
for (let i = 0; i < Math.min(30, data.length); i++) {
    const row = data[i];
    const firstCols = row.slice(0, 6).filter(c => c).join(' | ');
    if (firstCols) {
        console.log(`Row ${i + 1}: ${firstCols.substring(0, 100)}`);
    }
}

console.log('\n\n📋 Checking "Cost Center" tab...');
// The requirement says "Cost center tab"
console.log('Available sheets:', workbook.SheetNames);

// Check if there's a Cost Center sheet
const costCenterSheet = workbook.SheetNames.find(name =>
    name.toLowerCase().includes('cost') ||
    name.toLowerCase().includes('centre') ||
    name.toLowerCase().includes('center')
);

if (costCenterSheet) {
    console.log(`\n✅ Found sheet: ${costCenterSheet}`);
    const ws = workbook.Sheets[costCenterSheet];
    const sheetData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    console.log('\nFirst 15 rows of Cost Center sheet:');
    for (let i = 0; i < Math.min(15, sheetData.length); i++) {
        const row = sheetData[i];
        const cols = row.slice(0, 11).map((c, idx) =>
            c ? `${String.fromCharCode(65 + idx)}:${String(c).substring(0, 20)}` : ''
        ).filter(c => c).join(' | ');
        if (cols) {
            console.log(`Row ${i + 1}: ${cols}`);
        }
    }
} else {
    console.log('\n⚠️  No "Cost Center" sheet found');
}
