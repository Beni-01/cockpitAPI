const XLSX = require('xlsx');
const { pool } = require('../config/database');

/**
 * Import budget details from Conso P&L sheet
 * Usage: node src/utils/importBudgetDetails.js <path-to-excel-file>
 */

const importBudgetDetails = async (filePath) => {
    try {
        console.log('📂 Reading Excel file:', filePath);

        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = 'Conso P&L';

        if (!workbook.SheetNames.includes(sheetName)) {
            console.error(`❌ Sheet "${sheetName}" not found in workbook`);
            console.log('Available sheets:', workbook.SheetNames.join(', '));
            return;
        }

        const worksheet = workbook.Sheets[sheetName];

        // Read data starting from row 1 (row 1 has correct headers)
        const data = XLSX.utils.sheet_to_json(worksheet, {
            range: 0, // Use row 1 as headers
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
                    // Map Excel columns to database fields
                    const record = {
                        cost_center_code: row['Cost Center'] || null,
                        task_name: row['Description CC'] || null,
                        budget_year: 2026, // Default to 2026
                        province_ville: row['Province & Ville'] || null,
                        coordinations_provinciales: row['Coordinations provinciales'] || null,
                        local_etranger: row['Local / Etranger ?'] || null,
                        categories_grades: row['Catégorie / Grade'] || null,
                        nature_depenses: row['Nature Depenses'] ? String(row['Nature Depenses']) : null,
                        texte_libelle: row['Texte / Libelle'] || null,
                        unites_mesure: row['Unite de Mesure des donnees mensuelles'] || null,
                        total_unite_mesure: row['Total en Unite de Mesure des donnees mensuelles'] || 0,
                        total_budget_usd: row['Total Budget en USD'] || 0
                    };

                    // Skip if no cost center code
                    if (!record.cost_center_code ||
                        typeof record.cost_center_code !== 'string' ||
                        record.cost_center_code.trim() === '') {
                        skipped++;
                        continue;
                    }

                    // Skip if total budget is 0 or null
                    if (!record.total_budget_usd || record.total_budget_usd === 0) {
                        skipped++;
                        continue;
                    }

                    // Insert into database
                    await connection.query(
                        `INSERT INTO budget_details 
                        (cost_center_code, task_name, budget_year, province_ville, 
                         coordinations_provinciales, local_etranger, categories_grades, 
                         nature_depenses, texte_libelle, unites_mesure, 
                         total_unite_mesure, total_budget_usd) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        task_name = VALUES(task_name),
                        budget_year = VALUES(budget_year),
                        province_ville = VALUES(province_ville),
                        coordinations_provinciales = VALUES(coordinations_provinciales),
                        local_etranger = VALUES(local_etranger),
                        categories_grades = VALUES(categories_grades),
                        nature_depenses = VALUES(nature_depenses),
                        texte_libelle = VALUES(texte_libelle),
                        unites_mesure = VALUES(unites_mesure),
                        total_unite_mesure = VALUES(total_unite_mesure),
                        total_budget_usd = VALUES(total_budget_usd)`,
                        [
                            record.cost_center_code,
                            record.task_name,
                            record.budget_year,
                            record.province_ville,
                            record.coordinations_provinciales,
                            record.local_etranger,
                            record.categories_grades,
                            record.nature_depenses,
                            record.texte_libelle,
                            record.unites_mesure,
                            record.total_unite_mesure,
                            record.total_budget_usd
                        ]
                    );
                    inserted++;

                    if (inserted % 1000 === 0) {
                        console.log(`✅ Processed ${inserted} records...`);
                    }
                } catch (error) {
                    console.error('Error inserting row:', error.message);
                    skipped++;
                }
            }

            await connection.commit();
            console.log('\n╔════════════════════════════════════════════════════════════════╗');
            console.log('║                                                                ║');
            console.log('║   ✅ BUDGET DETAILS IMPORT COMPLETED SUCCESSFULLY             ║');
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
        console.log('Usage: node src/utils/importBudgetDetails.js <path-to-excel-file>');
        process.exit(1);
    }

    importBudgetDetails(filePath)
        .then(() => {
            console.log('✅ Import process completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Import process failed:', error);
            process.exit(1);
        });
}

module.exports = { importBudgetDetails };
