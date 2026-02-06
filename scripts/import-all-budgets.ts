import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

// Load environment variables
config();

/**
 * Master Budget Import Script
 * 
 * Step 1: Import Master Budget - Cost Center (creates/updates hierarchy)
 * Step 2: Import Budget Summary CSVs (creates/updates budget records)
 * 
 * This ensures all hierarchy entities exist before importing budget data
 */

// Initialize data source
const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'F360DB',
});

// Max code length to avoid DB errors (adjust if your DB schema allows longer)
const MAX_CODE_LENGTH = 50;

function normalizeCode(raw?: string | null): string | null {
    if (!raw && raw !== '') return null;
    const s = (raw || '').toString().trim();
    if (s === '') return null;
    if (s.length > MAX_CODE_LENGTH) {
        console.warn(`Truncating code to ${MAX_CODE_LENGTH} chars: ${s.slice(0, MAX_CODE_LENGTH)}...`);
        return s.slice(0, MAX_CODE_LENGTH);
    }
    return s;
}

// ============================================================================
// STEP 1: MASTER BUDGET - COST CENTER IMPORT
// ============================================================================

interface CostCenterRow {
    [key: string]: any;
}

async function upsertDepartment(
    dataSource: DataSource,
    code: string,
    name: string
): Promise<number> {
    if (!code || !name) {
        throw new Error('Department code and name are required');
    }

    let existing = await dataSource.query(
        'SELECT id, name FROM department WHERE code = ? LIMIT 1',
        [code]
    );

    if (existing && existing.length > 0) {
        const existingId = existing[0].id;
        const existingName = existing[0].name;

        if (existingName !== name) {
            await dataSource.query(
                'UPDATE department SET name = ? WHERE id = ?',
                [name, existingId]
            );
            console.log(`  ✓ Updated department: ${name} (${code})`);
        }

        return existingId;
    }

    const result = await dataSource.query(
        'INSERT INTO department (code, name) VALUES (?, ?)',
        [code, name]
    );

    console.log(`  ✓ Created department: ${name} (${code})`);
    return result.insertId;
}

async function upsertActivity(
    dataSource: DataSource,
    code: string,
    name: string,
    departmentId: number
): Promise<number> {
    if (!code || !name) {
        throw new Error('Activity code and name are required');
    }

    let existing = await dataSource.query(
        'SELECT id, name FROM budget_activity WHERE code = ? AND department_id = ? LIMIT 1',
        [code, departmentId]
    );

    if (existing && existing.length > 0) {
        const existingId = existing[0].id;
        const existingName = existing[0].name;

        if (existingName !== name) {
            await dataSource.query(
                'UPDATE budget_activity SET name = ? WHERE id = ?',
                [name, existingId]
            );
            console.log(`    ✓ Updated activity: ${name} (${code})`);
        }

        return existingId;
    }

    const result = await dataSource.query(
        'INSERT INTO budget_activity (code, name, department_id) VALUES (?, ?, ?)',
        [code, name, departmentId]
    );

    console.log(`    ✓ Created activity: ${name} (${code})`);
    return result.insertId;
}

async function upsertSousActivity(
    dataSource: DataSource,
    code: string,
    name: string,
    activityId: number,
    departmentId: number
): Promise<number> {
    if (!code || !name) {
        throw new Error('Sous Activity code and name are required');
    }

    let existing = await dataSource.query(
        'SELECT id, name, activity_id FROM budget_sous_activity WHERE code = ? AND department_id = ? LIMIT 1',
        [code, departmentId]
    );

    if (existing && existing.length > 0) {
        const existingId = existing[0].id;
        const existingName = existing[0].name;
        const existingActivityId = existing[0].activity_id;

        if (existingName !== name || existingActivityId !== activityId) {
            await dataSource.query(
                'UPDATE budget_sous_activity SET name = ?, activity_id = ? WHERE id = ?',
                [name, activityId, existingId]
            );
            console.log(`      ✓ Updated sous_activity: ${name} (${code})`);
        }

        return existingId;
    }

    const result = await dataSource.query(
        'INSERT INTO budget_sous_activity (code, name, activity_id, department_id) VALUES (?, ?, ?, ?)',
        ["", name, activityId, departmentId]
    );

    console.log(`      ✓ Created sous_activity: ${name} (${code})`);
    return result.insertId;
}

async function upsertTache(
    dataSource: DataSource,
    code: string,
    name: string,
    sousActivityId: number | null,
    activityId: number | null,
    departmentId: number,
): Promise<number> {
    if (!code || !name) {
        throw new Error('Tache code and name are required');
    }

    console.log(`        Processing tache: ${name} (${code})`);
    let existing = await dataSource.query(
        'SELECT id, name, cost_code, sous_activity_id, activity_id FROM budget_tache WHERE cost_code = ? AND department_id = ? LIMIT 1',
        [code, departmentId]
    );

    if (existing && existing.length > 0) {
        const existingId = existing[0].id;
        const existingName = existing[0].name;
        const existingCode = existing[0].code;
        const existingSousActivityId = existing[0].sous_activity_id;
        const existingActivityId = existing[0].activity_id;

        if (existingName !== name || existingCode !== code || existingSousActivityId !== sousActivityId || existingActivityId !== activityId) {
            await dataSource.query(
                'UPDATE budget_tache SET name = ?, code = ?, cost_code = ?, sous_activity_id = ?, activity_id = ? WHERE id = ?',
                [name, '', code, sousActivityId, activityId, existingId]
            );
            console.log(`        ✓ Updated tache: ${name} (${code}) (${existingId})`);
        }

        return existingId;
    }

    const result = await dataSource.query(
        `INSERT INTO budget_tache (code, cost_code, name, sous_activity_id, activity_id, department_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
        ['', code, name, sousActivityId, activityId, departmentId]
    );

    console.log(`        ✓ Created tache: ${name} (${code})`);
    return result.insertId;
}

async function processHierarchy(
    dataSource: DataSource,
    type: 'OPEX' | 'CAPEX',
    deptName: string,
    activityName: string,
    sousActivityName: string,
    tacheName: string,
    deptCode: string,
    activityCode: string,
    sousActivityCode: string,
    tacheCode: string,
): Promise<void> {
    // Only process CAPEX entries
    if (type !== 'CAPEX') {
        return;
    }

    // Special rule: If department is "FINANCE", rename to "CAPEX"
    if (deptName?.trim().toUpperCase() === 'FINANCE') {
        deptName = 'CAPEX';
    }

    if (!deptCode || !deptName) {
        return;
    }

    const departmentId = await upsertDepartment(dataSource, deptCode.trim(), deptName.trim());

    let activityId: number | null = null;
    let sousActivityId: number | null = null;

    if (activityCode && activityName) {
        activityId = await upsertActivity(
            dataSource,
            activityCode.trim(),
            activityName.trim(),
            departmentId
        );
    }

    if (sousActivityCode && sousActivityName && activityId) {
        sousActivityId = await upsertSousActivity(
            dataSource,
            sousActivityCode.trim(),
            sousActivityName.trim(),
            activityId,
            departmentId
        );
    }

    if (tacheCode && tacheName) {
        await upsertTache(
            dataSource,
            tacheCode.trim(),
            tacheName.trim(),
            sousActivityId,
            activityId,
            departmentId,
        );
    }
}

async function importMasterBudget(dataSource: DataSource): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('STEP 1: Import Master Budget - Cost Center');
    console.log('='.repeat(80));

    const csvPath = path.join(__dirname, '../data/Master Budget - Cost Center (1).csv');

    if (!fs.existsSync(csvPath)) {
        console.log('⚠ Master Budget file not found, skipping...');
        return;
    }

    const rows: CostCenterRow[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csv({ skipLines: 2, headers: false }))
            .on('data', (row: any) => {
                rows.push(row);
            })
            .on('end', async () => {
                try {
                    console.log(`  Found ${rows.length} rows\n`);

                    const processedDepts = new Set<string>();
                    let capexProcessed = 0;

                    for (const row of rows) {
                        try {
                            // Access by array index (row is array when headers: false)
                            // Primary mapping: C=dept (index 2), D=activity (3), E=sous (4), F=tache (5), G=deptCode (6)
                            const capexDept = (row[2] || '').toString().trim();
                            const capexActivity = (row[3] || '').toString().trim();
                            const capexSousActivity = (row[4] || '').toString().trim();
                            const capexTacheCode = (row[10] || '').toString().trim();
                            const capexTache = (row[5] || '').toString().trim();
                            const capexDeptCode = (row[6] || '').toString().trim();

                            // Helper to derive a code from a name when explicit code is not available
                            const deriveCode = (name?: string | null) => {
                                if (!name) return null;
                                const s = name.toString().trim().toUpperCase();
                                if (!s) return null;
                                return s;
                            };

                            // Attempt to read explicit codes if available (fall back to derived codes)
                            let capexActivityCode = (deriveCode(capexActivity) || null);
                            let capexSousActivityCode = (deriveCode(capexSousActivity) || null);
                            // let capexTacheCode = (row[22] || deriveCode(capexTacheCostCode) || null);

                            capexActivityCode = normalizeCode(capexActivityCode);
                            capexSousActivityCode = normalizeCode(capexSousActivityCode);
                            // capexTacheCode = normalizeCode(capexTacheCode);
                            // Process CAPEX if department code and name exist
                            if (capexDeptCode && capexDept) {
                                // Skip if activity or sous_activity codes equal explicit '0'
                                if (capexActivityCode === '0' || capexSousActivityCode === '0') {
                                    continue;
                                }

                                const key = `CAPEX-${capexDeptCode}-${capexActivityCode}-${capexSousActivityCode}-${capexTacheCode}`;
                                if (!processedDepts.has(key)) {
                                    await processHierarchy(
                                        dataSource,
                                        'CAPEX',
                                        capexDept,
                                        capexActivity,
                                        capexSousActivity,
                                        capexTache,
                                        capexDeptCode,
                                        capexActivityCode,
                                        capexSousActivityCode,
                                        capexTacheCode,
                                    );
                                    processedDepts.add(key);
                                    capexProcessed++;
                                }
                            }

                        } catch (error) {
                            console.error(`    ✗ Error processing row:`, error.message);
                        }
                    }

                    console.log(`\n  ✓ Processed: ${capexProcessed} CAPEX entries (OPEX skipped)`);
                    resolve();

                } catch (error) {
                    reject(error);
                }
            })
            .on('error', reject);
    });
}

// ============================================================================
// STEP 2: BUDGET SUMMARY CSVs IMPORT
// ============================================================================

interface CsvRow {
    'Cost Center': string;
    'Description CC': string;
    'Province & Ville': string;
    'Coordinations provinciales': string;
    'Local / Etranger ?': string;
    'Catégorie / Grade': string;
    'Nature Depenses': string;
    'Account Ohada': string;
    'Departement ': string;
    'Texte / Libelle': string;
    'Unite de Mesure des donnees mensuelles': string;
    'Cout Unitaire en USD Hors Taxe': string;
    '31-janv.': string;
    '28-févr.': string;
    '31-mars': string;
    '30-avr.': string;
    '31-mai': string;
    '30-juin': string;
    '31-juil.': string;
    '31-août': string;
    '30-sept.': string;
    '31-oct.': string;
    '30-nov.': string;
    '31-déc.': string;
    'Total en Unite de Mesure des donnees mensuelles': string;
    'Total Budget en USD': string;
    'CODE DEPARTEMENT': string;
    'CODE ACTIVITE': string;
    'CODE SOUS ACTIVITE': string;
    'CODE TACHE': string;
    [key: string]: any;
}

function parseDescriptionCC(description: string): {
    departmentName: string;
    activityName: string | null;
    sousActivityName: string | null;
    tacheName: string | null;
} {
    if (!description) {
        return { departmentName: '', activityName: null, sousActivityName: null, tacheName: null };
    }

    const parts = description.split('_').map(p => p.trim()).filter(p => p !== '');

    return {
        departmentName: parts[0] || '',
        activityName: parts[1] || null,
        sousActivityName: parts[2] || null,
        tacheName: parts[3] || null,
    };
}

async function insertBudgetRecord(
    dataSource: DataSource,
    row: CsvRow,
    departmentId: number,
    activityId: number | null,
    sousActivityId: number | null,
    tacheId: number | null,
    assignedDepartmentId: number | null
): Promise<void> {
    const parseDecimal = (val: string | undefined): number | null => {
        if (!val || val.trim() === '') return null;
        const num = parseFloat(val.replace(/,/g, '').replace(/\s/g, ''));
        return isNaN(num) ? null : num;
    };

    const costCenter = row['Cost Center'] || null;

    const existing = await dataSource.query(
        'SELECT id FROM budget WHERE cost_center = ? LIMIT 1',
        [costCenter]
    );

    const values = [
        row['Description CC'] || null,
        row['Province & Ville'] || null,
        row['Coordinations provinciales'] || null,
        row['Local / Etranger ?'] || null,
        row['Catégorie / Grade'] || null,
        row['Nature Depenses'] || null,
        row['Account Ohada'] || null,
        row['Departement '] || null,
        row['Texte / Libelle'] || null,
        row['Unite de Mesure des donnees mensuelles'] || null,
        parseDecimal(row['Cout Unitaire en USD Hors Taxe']),
        parseDecimal(row['31-janv.']),
        parseDecimal(row['28-févr.']),
        parseDecimal(row['31-mars']),
        parseDecimal(row['30-avr.']),
        parseDecimal(row['31-mai']),
        parseDecimal(row['30-juin']),
        parseDecimal(row['31-juil.']),
        parseDecimal(row['31-août']),
        parseDecimal(row['30-sept.']),
        parseDecimal(row['31-oct.']),
        parseDecimal(row['30-nov.']),
        parseDecimal(row['31-déc.']),
        parseDecimal(row['Total en Unite de Mesure des donnees mensuelles']),
        parseDecimal(row['Total Budget en USD']),
    ];

    // Removed IDs from values array

    const buildBudgetObject = () => ({
        cost_center: costCenter,
        description_cc: row['Description CC'] || null,
        province_ville: row['Province & Ville'] || null,
        coordinations_provinciales: row['Coordinations provinciales'] || null,
        local_etranger: row['Local / Etranger ?'] || null,
        categorie_grade: row['Catégorie / Grade'] || null,
        nature_depenses: row['Nature Depenses'] || null,
        account_ohada: row['Account Ohada'] || null,
        departement: row['Departement '] || null,
        texte_libelle: row['Texte / Libelle'] || null,
        unite_mesure: row['Unite de Mesure des donnees mensuelles'] || null,
        cout_unitaire_usd: parseDecimal(row['Cout Unitaire en USD Hors Taxe']),
        jan: parseDecimal(row['31-janv.']),
        feb: parseDecimal(row['28-févr.']),
        mar: parseDecimal(row['31-mars']),
        apr: parseDecimal(row['30-avr.']),
        may: parseDecimal(row['31-mai']),
        jun: parseDecimal(row['30-juin']),
        jul: parseDecimal(row['31-juil.']),
        aug: parseDecimal(row['31-août']),
        sep: parseDecimal(row['30-sept.']),
        oct: parseDecimal(row['31-oct.']),
        nov: parseDecimal(row['30-nov.']),
        dec: parseDecimal(row['31-déc.']),
        total_units: parseDecimal(row['Total en Unite de Mesure des donnees mensuelles']),
        total_budget_usd: parseDecimal(row['Total Budget en USD']),
        department_id: departmentId,
        activity_id: activityId,
        sous_activity_id: sousActivityId,
        tache_id: tacheId,
        updated_at: new Date(),
        created_at: new Date(),
    });
    if (existing && existing.length > 0) {
        try {
            await dataSource.createQueryBuilder()
                .update('budget')
                .set({ ...buildBudgetObject(), assigned_department_id: assignedDepartmentId })
                .where('id = :id', { id: existing[0].id })
                .execute();
        } catch (e) {
            console.error('Update via QueryBuilder failed', e);
            throw e;
        }
    } else {
        try {
            const res: any = await dataSource.createQueryBuilder()
                .insert()
                .into('budget')
                .values([buildBudgetObject()])
                .execute();

            if (assignedDepartmentId && res && res.identifiers && res.identifiers[0] && res.identifiers[0].id) {
                await dataSource.query('UPDATE budget SET assigned_department_id = ? WHERE id = ?', [assignedDepartmentId, res.identifiers[0].id]);
            }
        } catch (e) {
            console.error('Insert via QueryBuilder failed', e);
            throw e;
        }
    }
}

async function processCSVFile(dataSource: DataSource, filePath: string, filename: string): Promise<void> {
    console.log(`\n📄 Processing: ${filename}`);

    const rows: CsvRow[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({ skipLines: 11 }))
            .on('data', (row: any) => {
                const costCenter = row['Cost Center'];
                if (costCenter && costCenter.trim() !== '' && costCenter.includes('.')) {
                    rows.push(row as CsvRow);
                }
            })
            .on('end', async () => {
                try {
                    console.log(`  Found ${rows.length} valid data rows`);
                    let imported = 0;
                    let skipped = 0;

                    // Preload departments for assigned_department matching
                    const departmentsList: Array<{ id: number; name: string }> = await dataSource.query(
                        'SELECT id, name FROM department'
                    );

                    for (const row of rows) {
                        try {
                            const { departmentName, activityName, sousActivityName, tacheName } =
                                parseDescriptionCC(row['Description CC']);
                            let deptCode = row['CODE DEPARTEMENT']?.trim();
                            let actCode = row['CODE ACTIVITE']?.trim();
                            let sousCode = row['CODE SOUS ACTIVITE']?.trim();
                            let tacheCode = row['CODE TACHE']?.trim();
                            const costCenter = row['Cost Center'] || null;
                            const foundTache = await dataSource.query(
                                'SELECT id, department_id, activity_id, sous_activity_id FROM budget_tache WHERE cost_code = ? LIMIT 1',
                                [costCenter]
                            );
                            // Normalize/truncate codes to match DB limits
                            deptCode = normalizeCode(deptCode);
                            actCode = normalizeCode(actCode);
                            sousCode = normalizeCode(sousCode);
                            tacheCode = normalizeCode(tacheCode);


                            // Do NOT create departments from budget summary sheets.
                            // Require department to already exist (created by Master Cost Center import).
                            // const deptRes: any = await dataSource.query('SELECT id FROM department WHERE name = ? LIMIT 1', [departmentName]);
                            // if (!deptRes || deptRes.length === 0) {
                            //     // department missing — skip this row
                            //     skipped++;
                            //     continue;
                            // }
                            let departmentId: number | null = null;
                            let activityId: number | null = null;
                            let sousActivityId: number | null = null;
                            let tacheId: number | null = null;
                            if (foundTache && foundTache.length) {
                                tacheId = foundTache[0].id;
                                departmentId = foundTache[0].department_id;
                                activityId = foundTache[0].activity_id;
                                sousActivityId = foundTache[0].sous_activity_id;
                            }
                            // // For budget summary sheets: DO NOT create new activities or sous-activities.
                            // // Only use existing ones if they can be found by code.
                            // if (activityName) {
                            //     const foundAct = await dataSource.query(
                            //         'SELECT id FROM budget_activity WHERE name = ? AND department_id = ? LIMIT 1',
                            //         [activityName, departmentId]
                            //     );
                            //     if (foundAct && foundAct.length) activityId = foundAct[0].id;
                            // }

                            // if (sousActivityName && activityId) {
                            //     const foundSous = await dataSource.query(
                            //         'SELECT id FROM budget_sous_activity WHERE name = ? AND activity_id = ? LIMIT 1',
                            //         [sousActivityName, activityId]
                            //     );
                            //     if (foundSous && foundSous.length) sousActivityId = foundSous[0].id;
                            // }

                            // // Do not create activities, sous-activities or taches from budget summary sheets.
                            // // Use existing tache if present (created by Master Cost Center import).
                            // if (tacheName) {
                            //     const foundTache = await dataSource.query(
                            //         'SELECT id FROM budget_tache WHERE name = ?  AND sous_activity_id = ? LIMIT 1',
                            //         [tacheName, sousActivityId]
                            //     );
                            //     if (foundTache && foundTache.length) tacheId = foundTache[0].id;
                            // }

                            // determine assigned_department_id by matching department names inside Description CC
                            let assignedDepartmentId: number | null = null;
                            const description = (row['Description CC'] || '').toString();
                            if (departmentName === "RESSOURCES HUMAINES") {
                                const trimmedDesc = description.replace("RESSOURCES HUMAINES", "").trim();

                                const descUpper = trimmedDesc.toUpperCase();
                                departmentsList?.map((d) => {
                                    if (descUpper?.includes(d.name.toUpperCase())) {
                                        console.log(`Looking for department name "${departmentName}" in description "${descUpper}"`,);
                                        assignedDepartmentId = d.id;
                                    }
                                })
                                // for (const d of departmentsList) {
                                //     console.log(`Checking if department name "${d}" is in description "${descUpper}", looking for "${departmentName}"`);
                                //     if (d.name && descUpper.includes(departmentName)) {
                                //         assignedDepartmentId = d.id;
                                //         break;
                                //     }
                                // }
                                console.log(`Row cost_center=${costCenter} assigned_department_id=${assignedDepartmentId} departmentId=${departmentId} activityId=${activityId} sousActivityId=${sousActivityId} tacheId=${tacheId}`);

                            }

                            await insertBudgetRecord(dataSource, row, departmentId, activityId, sousActivityId, tacheId, assignedDepartmentId);
                            imported++;

                        } catch (error) {
                            console.error(`    ✗ Error processing row:`, error.message);
                            skipped++;
                        }
                    }

                    console.log(`  ✓ Processed: ${imported} records, Skipped: ${skipped}`);
                    resolve();

                } catch (error) {
                    reject(error);
                }
            })
            .on('error', reject);
    });
}

async function importBudgetSummaries(dataSource: DataSource): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: Import Budget Summary CSVs');
    console.log('='.repeat(80));

    const budgetSummaryFolder = path.join(__dirname, '../data/budget_summary');

    if (!fs.existsSync(budgetSummaryFolder)) {
        console.log('⚠ Budget summary folder not found, skipping...');
        return;
    }

    const files = fs.readdirSync(budgetSummaryFolder).filter(f => f.endsWith('.csv'));
    console.log(`Found ${files.length} CSV files to process\n`);

    for (const file of files) {
        const filePath = path.join(budgetSummaryFolder, file);
        await processCSVFile(dataSource, filePath, file);
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    console.log('='.repeat(80));
    console.log('MASTER BUDGET IMPORT - ALL STEPS');
    console.log('='.repeat(80));

    try {
        await AppDataSource.initialize();
        console.log('✓ Database connected');

        // Step 1: Import hierarchy from Master Budget
        // await importMasterBudget(AppDataSource);

        // Step 2: Import budget records from Summary CSVs
        await importBudgetSummaries(AppDataSource);

        console.log('\n' + '='.repeat(80));
        console.log('✓ ALL IMPORTS COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n' + '='.repeat(80));
        console.error('✗ Import failed:', error);
        console.error('='.repeat(80));
    } finally {
        await AppDataSource.destroy();
        console.log('\n✓ Database connection closed');
    }
}

main()
    .then(() => {
        console.log('\n✓ Script completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n✗ Script failed:', error);
        process.exit(1);
    });
