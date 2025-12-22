const XLSX = require('xlsx');
try {
    const workbook = XLSX.readFile('../Budget_Département/Fonarev_Budget_Etudes.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Row 9 Headers:', JSON.stringify(data[8]));
    console.log('Row 10 Headers:', JSON.stringify(data[9]));
    console.log('Row 11 Headers:', JSON.stringify(data[10]));
} catch (e) {
    console.error(e);
}
