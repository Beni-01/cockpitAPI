const XLSX = require('xlsx');

const filePath = './data/Master Budget.xlsx';
const workbook = XLSX.readFile(filePath);

console.log('📊 Available sheets in Master Budget.xlsx:\n');
workbook.SheetNames.forEach((name, idx) => {
    console.log(`${idx + 1}. ${name}`);
});

console.log('\n\n🔍 Analyzing each sheet...\n');

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    // Count non-empty rows
    const nonEmptyRows = data.filter(row => row.some(cell => cell !== '')).length;

    console.log(`\n📋 Sheet: "${sheetName}"`);
    console.log(`   Total rows: ${data.length}`);
    console.log(`   Non-empty rows: ${nonEmptyRows}`);

    // Show first 5 rows
    console.log('   First 5 rows:');
    for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        const preview = row.slice(0, 6).map((c, idx) =>
            c ? `${String.fromCharCode(65 + idx)}:${String(c).substring(0, 20)}` : ''
        ).filter(c => c).join(' | ');
        if (preview) {
            console.log(`     Row ${i + 1}: ${preview}`);
        }
    }
});

console.log('\n\n💡 Which sheet should we use?');
console.log('Please tell me which sheet name contains the data you want to import.');
