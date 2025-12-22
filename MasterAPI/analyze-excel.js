const XLSX = require('xlsx');
const path = require('path');

// Quick analysis of Excel structure
const filePath = './data/Master Budget.xlsx';

console.log('📂 Analyzing Excel file structure...\n');

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log(`Sheet name: ${sheetName}\n`);

// Read first 10 rows with all columns
console.log('First 10 rows (all columns):');
const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,  // Use array format
    defval: ''  // Default value for empty cells
});

// Show first 10 rows
for (let i = 0; i < Math.min(10, data.length); i++) {
    console.log(`\nRow ${i + 1}:`);
    const row = data[i];
    for (let j = 0; j < Math.min(12, row.length); j++) {
        const colLetter = String.fromCharCode(65 + j); // A, B, C, etc.
        if (row[j]) {
            console.log(`  ${colLetter}: ${String(row[j]).substring(0, 50)}`);
        }
    }
}

console.log('\n\n📊 Analysis:');
console.log(`Total rows: ${data.length}`);
console.log(`Max columns: ${Math.max(...data.map(row => row.length))}`);

// Find where actual data starts
console.log('\n🔍 Looking for data start row...');
for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (row[0] && row[1] && row[2]) {
        console.log(`Row ${i + 1} has data in columns A, B, C`);
        console.log(`  A: ${String(row[0]).substring(0, 30)}`);
        console.log(`  B: ${String(row[1]).substring(0, 30)}`);
        console.log(`  C: ${String(row[2]).substring(0, 30)}`);
    }
}
