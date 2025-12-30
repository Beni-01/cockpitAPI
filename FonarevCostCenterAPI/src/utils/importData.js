const XLSX = require('xlsx');
const { pool } = require('../config/database');
const path = require('path');

/**
 * Import data from Excel file to database
 * Usage: node src/utils/importData.js <path-to-excel-file>
 */

const importFromExcel = async (filePath) => {
    try {
        console.log('📂 Reading Excel file:', filePath);

        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = 'Cost Center';

        if (!workbook.SheetNames.includes(sheetName)) {
            console.error(`❌ Sheet "${sheetName}" not found in workbook`);
            console.log('Available sheets:', workbook.SheetNames.join(', '));
            return;
        }

        const worksheet = workbook.Sheets[sheetName];

        // Read with header row starting at row 2 (row 1 has the actual column names)
        const data = XLSX.utils.sheet_to_json(worksheet, {
            range: 1, // Start from row 2, using row 1 as headers
            defval: null
        });

        console.log(`📊 Found ${data.length} rows in Excel file`);

        // Transform and insert data
        const connection = await pool.getConnection();
        let inserted = 0;
        let skipped = 0;

        try {
            await connection.beginTransaction();

            for (const row of data) {
                try {
                    // Process OPEX section (columns 1-13)
                    const opexRecord = {
                        mapping_cashflow: row['Mapping CashFlow'] || null,
                        departement_direction: row['DEPARTEMENT / DIRECTION'] || null,
                        activites: row['ACTIVITES'] || null,
                        sous_activites: row['SOUS ACTVITES'] || null,
                        taches: row['TACHES'] || null,
                        code_departement: row['CODE DEPARTEMENT'] || null,
                        code_activite: row['CODE ACTIVITE'] !== undefined ? String(row['CODE ACTIVITE']) : null,
                        code_sous_activite: row['CODE SOUS ACTIVITE'] !== undefined ? String(row['CODE SOUS ACTIVITE']) : null,
                        code_tache: row['CODE TACHE'] || null,
                        cost_code: row['COST CODE'] || null
                    };

                    // Process CAPEX section (columns 14-29)
                    const capexRecord = {
                        mapping_cashflow: 'Dépenses en capital', // CAPEX is capital expenses
                        departement_direction: row['DEPARTEMENT / DIRECTION_1'] || null,
                        activites: row['ACTIVITES_1'] || null,
                        sous_activites: row['SOUS ACTVITES_1'] || null,
                        taches: row['TACHES_1'] || null,
                        code_departement: row['CODE DEPARTEMENT_1'] || null,
                        code_activite: row['CODE ACTIVITE_1'] !== undefined ? String(row['CODE ACTIVITE_1']) : null,
                        code_sous_activite: row['CODE SOUS ACTIVITE_1'] !== undefined ? String(row['CODE SOUS ACTIVITE_1']) : null,
                        code_tache: row['CODE TACHE_1'] || null,
                        cost_code: row['COST CODE_1'] || null
                    };

                    // Array of records to process (OPEX and CAPEX)
                    const records = [opexRecord, capexRecord];

                    for (const record of records) {
                        // Skip if no cost code
                        if (!record.cost_code ||
                            typeof record.cost_code !== 'string' ||
                            record.cost_code.trim() === '') {
                            skipped++;
                            continue;
                        }

                        // Skip if department is missing
                        if (!record.departement_direction || record.departement_direction.trim() === '') {
                            skipped++;
                            continue;
                        }

                        // Insert into database
                        await connection.query(
                            `INSERT INTO cost_center 
                            (mapping_cashflow, departement_direction, activites, sous_activites, taches, 
                             code_departement, code_activite, code_sous_activite, code_tache, cost_code) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                            mapping_cashflow = VALUES(mapping_cashflow),
                            departement_direction = VALUES(departement_direction),
                            activites = VALUES(activites),
                            sous_activites = VALUES(sous_activites),
                            taches = VALUES(taches),
                            code_departement = VALUES(code_departement),
                            code_activite = VALUES(code_activite),
                            code_sous_activite = VALUES(code_sous_activite),
                            code_tache = VALUES(code_tache)`,
                            [
                                record.mapping_cashflow,
                                record.departement_direction,
                                record.activites,
                                record.sous_activites,
                                record.taches,
                                record.code_departement,
                                record.code_activite,
                                record.code_sous_activite,
                                record.code_tache,
                                record.cost_code
                            ]
                        );
                        inserted++;

                        if (inserted % 50 === 0) {
                            console.log(`✅ Processed ${inserted} records...`);
                        }
                    }
                } catch (error) {
                    console.error('Error inserting row:', error.message);
                    skipped++;
                }
            }

            await connection.commit();
            console.log('\n╔════════════════════════════════════════════════════════════════╗');
            console.log('║                                                                ║');
            console.log('║   ✅ IMPORT COMPLETED SUCCESSFULLY                            ║');
            console.log('║                                                                ║');
            console.log('╚════════════════════════════════════════════════════════════════╝\n');
            console.log(`📊 Total rows in Excel: ${data.length}`);
            console.log(`✅ Records inserted/updated: ${inserted}`);
            console.log(`⚠️  Records skipped: ${skipped}`);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Import failed:', error.message);
        throw error;
    }
};

// Run import if called directly
if (require.main === module) {
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('❌ Please provide the path to the Excel file');
        console.log('Usage: node src/utils/importData.js <path-to-excel-file>');
        process.exit(1);
    }

    importFromExcel(filePath)
        .then(() => {
            console.log('✅ Import process completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Import process failed:', error);
            process.exit(1);
        });
}

module.exports = { importFromExcel };
