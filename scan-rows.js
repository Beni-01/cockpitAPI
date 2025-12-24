const XLSX = require('xlsx');
try {
    const workbook = XLSX.readFile('../Budget_Département/Fonarev_Budget_Etudes.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const spreadsheetId = '11VRf7VFAlJeFDPyVOcJqZMk9pgWOU6V5'; // Board of Directors
    a = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('Scanning rows for headers...');
    data.slice(0, 20).forEach((row, i) => {
        const nonEmpty = row.filter(c => c !== null && c !== undefined && String(c).trim() !== '');
        if (nonEmpty.length > 2) {
            console.log(`Row ${i + 1}:`, JSON.stringify(nonEmpty));
        }
    });
} catch (e) {
    console.error(e);
}
