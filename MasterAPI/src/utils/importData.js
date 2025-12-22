const XLSX = require('xlsx');
const path = require('path');
const MasterData = require('../models/MasterData');
const { testConnection } = require('../config/database');
require('dotenv').config();

/**
 * Import data from Excel file (columns B to K)
 */
async function importFromExcel(filePath) {
    try {
        console.log('📂 Reading Excel file...');

        // Read the workbook
        const workbook = XLSX.readFile(filePath);

        // Use "Cost Center" sheet as per requirements
        const sheetName = 'Cost Center';
        if (!workbook.SheetNames.includes(sheetName)) {
            throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
        }

        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON (starting from row 3, row 2 is headers)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            range: 2, // Skip rows 1-2 (row 2 has headers, start from row 3)
            header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] // Column names
        });

        console.log(`📊 Found ${jsonData.length} rows in Cost Center sheet`);

        // Transform data to match database schema
        // Exact column mapping from Cost Center sheet:
        // A = Mapping CashFlow
        // B = DEPARTEMENT / DIRECTION
        // C = ACTIVITES
        // D = SOUS ACTVITES
        // E = TACHES
        // F = CODE DEPARTEMENT
        // G = CODE ACTIVITE
        // H = CODE SOUS ACTIVITE
        // I = CODE TACHE
        // J = COST CODE
        const transformedData = jsonData.map(row => ({
            mapping_cashflow: row.A || '',
            departement_direction: row.B || '',
            activites: row.C || '',
            sous_activites: row.D || '',
            taches: row.E || '',
            code_departement: row.F || '',
            code_activite: row.G || '',
            code_sous_activite: row.H || '',
            code_tache: row.I || '',
            cost_code: row.J || ''
        })).filter(row => {
            // Filter out empty rows
            return Object.values(row).some(val => val !== '');
        });

        console.log(`✅ Transformed ${transformedData.length} valid rows`);

        if (transformedData.length === 0) {
            console.log('⚠️  No valid data found in Excel file');
            return;
        }

        // Connect to database
        console.log('🔌 Connecting to database...');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }

        // Bulk insert data
        console.log('💾 Inserting data into database...');
        const result = await MasterData.bulkInsert(transformedData);

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                                                            ║');
        console.log('║              ✅ IMPORT COMPLETED SUCCESSFULLY              ║');
        console.log('║                                                            ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        console.log(`📊 Total rows imported: ${result.insertedCount}`);
        console.log(`📁 Source file: ${filePath}\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Import failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Get file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('\n❌ Error: No file path provided');
    console.log('\nUsage: npm run import <path-to-excel-file>');
    console.log('Example: npm run import ./data/master-data.xlsx\n');
    process.exit(1);
}

const filePath = path.resolve(args[0]);
importFromExcel(filePath);
