import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

// Load environment variables
config();

/**
 * Import Budget Summary CSVs - Version 2
 * 
 * Handles actual CSV format with:
 * - Metadata rows in first 4 lines (Annee, Mois, Trimestre, Semestre)
 * - Empty rows and headers (lines 5-13)
 * - Data starting at line 14
 * - Uses CODE DEPARTEMENT, CODE ACTIVITE, CODE SOUS ACTIVITE, CODE TACHE columns
 * - Parses Description CC for full names
 * 
 * UPSERT Logic:
 * - Departments: Update by code if exists
 * - Activities: Update by code + department_id if exists
 * - Sous Activities: Update by code + department_id if exists
 * - Taches: Update by code + department_id if exists
 * - Budget: Update by cost_center if exists
 * 
 * Safe to run multiple times - will update existing records instead of creating duplicates
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

interface CsvRow {
  'Cost Center': string;
  'Description CC': string;
  'Province & Ville': string;
  'Coordinations provinciales': string;
  'Local / Etranger ?': string;
  'Catégorie / Grade': string;
  'Nature Depenses': string;
  'Account Ohada': string;
  'Departement ': string;  // Note: extra space in CSV
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

/**
 * Parse Description CC to extract hierarchy names
 * Pattern: "ACCES A LA JUSTICE _ Activity Name _ Sous Activity Name _ Tache Name"
 */
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

/**
 * Upsert department (update if exists by code, insert if not)
 */
async function findOrCreateDepartment(
  dataSource: DataSource,
  code: string,
  name: string
): Promise<number> {
  // Try to find by code first
  let existing = await dataSource.query(
    'SELECT id, name FROM department WHERE code = ? LIMIT 1',
    [code]
  );

  if (existing && existing.length > 0) {
    const existingId = existing[0].id;
    const existingName = existing[0].name;
    
    // Update name if different
    if (existingName !== name) {
      await dataSource.query(
        'UPDATE department SET name = ? WHERE id = ?',
        [name, existingId]
      );
      console.log(`  ✓ Updated department: ${name} (${code}, ID: ${existingId})`);
    } else {
      console.log(`  ✓ Found department: ${name} (${code}, ID: ${existingId})`);
    }
    
    return existingId;
  }

  // Create new department
  const result = await dataSource.query(
    'INSERT INTO department (code, name) VALUES (?, ?)',
    [code, name]
  );

  console.log(`  ✓ Created department: ${name} (${code}, ID: ${result.insertId})`);
  return result.insertId;
}

/**
 * Upsert activity (update if exists by code+department, insert if not)
 */
async function findOrCreateActivity(
  dataSource: DataSource,
  code: string,
  name: string,
  departmentId: number
): Promise<number> {
  // Check by code AND department_id
  let existing = await dataSource.query(
    'SELECT id, name, department_id FROM budget_activity WHERE code = ? AND department_id = ? LIMIT 1',
    [code, departmentId]
  );

  if (existing && existing.length > 0) {
    const existingId = existing[0].id;
    const existingName = existing[0].name;
    
    // Update name if different
    if (existingName !== name) {
      await dataSource.query(
        'UPDATE budget_activity SET name = ? WHERE id = ?',
        [name, existingId]
      );
      console.log(`    ✓ Updated activity: ${name} (${code})`);
    }
    
    return existingId;
  }

  // Create new activity
  const result = await dataSource.query(
    'INSERT INTO budget_activity (code, name, department_id) VALUES (?, ?, ?)',
    [code, name, departmentId]
  );

  console.log(`    ✓ Created activity: ${name} (${code})`);
  return result.insertId;
}

/**
 * Upsert sous activity (update if exists by code+department, insert if not)
 */
async function findOrCreateSousActivity(
  dataSource: DataSource,
  code: string,
  name: string,
  activityId: number,
  departmentId: number
): Promise<number> {
  // Check by code AND department_id
  let existing = await dataSource.query(
    'SELECT id, name, activity_id FROM budget_sous_activity WHERE code = ? AND department_id = ? LIMIT 1',
    [code, departmentId]
  );

  if (existing && existing.length > 0) {
    const existingId = existing[0].id;
    const existingName = existing[0].name;
    const existingActivityId = existing[0].activity_id;
    
    // Update name and/or activity_id if different
    if (existingName !== name || existingActivityId !== activityId) {
      await dataSource.query(
        'UPDATE budget_sous_activity SET name = ?, activity_id = ? WHERE id = ?',
        [name, activityId, existingId]
      );
      console.log(`      ✓ Updated sous_activity: ${name} (${code})`);
    }
    
    return existingId;
  }

  // Create new sous activity
  const result = await dataSource.query(
    'INSERT INTO budget_sous_activity (code, name, activity_id, department_id) VALUES (?, ?, ?, ?)',
    [code, name, activityId, departmentId]
  );

  console.log(`      ✓ Created sous_activity: ${name} (${code})`);
  return result.insertId;
}

/**
 * Upsert tache (update if exists by code+department, insert if not)
 */
async function findOrCreateTache(
  dataSource: DataSource,
  code: string,
  name: string,
  sousActivityId: number | null,
  activityId: number | null,
  departmentId: number
): Promise<number> {
  // Check by cost_code AND department_id
  let existing = await dataSource.query(
    'SELECT id, name, code, cost_code, sous_activity_id, activity_id FROM budget_tache WHERE cost_code = ? AND department_id = ? LIMIT 1',
    [code, departmentId]
  );

  if (existing && existing.length > 0) {
    const existingId = existing[0].id;
    const existingName = existing[0].name;
    const existingCode = existing[0].code;
    const existingSousActivityId = existing[0].sous_activity_id;
    const existingActivityId = existing[0].activity_id;
    
    // Update if name, code, or relationships changed
    if (existingName !== name || existingCode !== code || existingSousActivityId !== sousActivityId || existingActivityId !== activityId) {
      await dataSource.query(
        'UPDATE budget_tache SET name = ?, code = ?, cost_code = ?, sous_activity_id = ?, activity_id = ? WHERE id = ?',
        [name, code, code, sousActivityId, activityId, existingId]
      );
      console.log(`        ✓ Updated tache: ${name} (${code})`);
    }
    
    return existingId;
  }

  // Create new tache
  const result = await dataSource.query(
    `INSERT INTO budget_tache (code, cost_code, name, sous_activity_id, activity_id, department_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [code, code, name, sousActivityId, activityId, departmentId]
  );

  console.log(`        ✓ Created tache: ${name} (${code})`);
  return result.insertId;
}

/**
 * Upsert budget record (update if exists by cost_center, insert if not)
 */
async function insertBudgetRecord(
  dataSource: DataSource,
  row: CsvRow,
  departmentId: number,
  activityId: number | null,
  sousActivityId: number | null,
  tacheId: number | null
): Promise<void> {
  const parseDecimal = (val: string | undefined): number | null => {
    if (!val || val.trim() === '') return null;
    const num = parseFloat(val.replace(/,/g, '').replace(/\s/g, ''));
    return isNaN(num) ? null : num;
  };
  
  const costCenter = row['Cost Center'] || null;
  
  // Check if budget record exists by cost_center
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
    row['Departement '] || null,  // Note: extra space in CSV
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
    departmentId,
    activityId,
    sousActivityId,
    tacheId,
  ];

  if (existing && existing.length > 0) {
    // UPDATE existing record
    const updateQuery = `
      UPDATE budget SET
        description_cc = ?,
        province_ville = ?,
        coordinations_provinciales = ?,
        local_etranger = ?,
        categorie_grade = ?,
        nature_depenses = ?,
        account_ohada = ?,
        departement = ?,
        texte_libelle = ?,
        unite_mesure = ?,
        cout_unitaire_usd = ?,
        jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?, 
        jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, \`dec\` = ?,
        total_units = ?,
        total_budget_usd = ?,
        department_id = ?,
        activity_id = ?,
        sous_activity_id = ?,
        tache_id = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    
    await dataSource.query(updateQuery, [...values, existing[0].id]);
  } else {
    // INSERT new record
    const insertQuery = `
      INSERT INTO budget (
        cost_center,
        description_cc,
        province_ville,
        coordinations_provinciales,
        local_etranger,
        categorie_grade,
        nature_depenses,
        account_ohada,
        departement,
        texte_libelle,
        unite_mesure,
        cout_unitaire_usd,
        jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, \`dec\`,
        total_units,
        total_budget_usd,
        department_id,
        activity_id,
        sous_activity_id,
        tache_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await dataSource.query(insertQuery, [costCenter, ...values]);
  }
}

/**
 * Process a single CSV file
 */
async function processCSVFile(dataSource: DataSource, filePath: string, filename: string): Promise<void> {
  console.log(`\n📄 Processing: ${filename}`);

  const rows: CsvRow[] = [];
  let lineNumber = 0;
  let headerLineFound = false;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ skipLines: 11 })) // Skip first 11 lines (metadata + empty rows)
      .on('data', (row: any) => {
        lineNumber++;
        
        // Skip the second header row and any empty rows
        // Valid data rows have Cost Center starting with department code (e.g., "FI.1.1.01")
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

          for (const row of rows) {
            try {
              // Parse hierarchy from Description CC
              const { departmentName, activityName, sousActivityName, tacheName } = 
                parseDescriptionCC(row['Description CC']);

              const deptCode = row['CODE DEPARTEMENT']?.trim();
              const actCode = row['CODE ACTIVITE']?.trim();
              const sousCode = row['CODE SOUS ACTIVITE']?.trim();
              const tacheCode = row['CODE TACHE']?.trim();

              if (!deptCode) {
                skipped++;
                continue;
              }

              // Find or create department
              const departmentId = await findOrCreateDepartment(
                dataSource,
                deptCode,
                departmentName || deptCode
              );

              let activityId: number | null = null;
              let sousActivityId: number | null = null;
              let tacheId: number | null = null;

              // Create activity if exists (even if code is '0')
              if (actCode && activityName) {
                activityId = await findOrCreateActivity(
                  dataSource,
                  actCode,
                  activityName,
                  departmentId
                );
              }

              // Create sous_activity if exists (even if code is '0')
              if (sousCode && sousActivityName && activityId) {
                sousActivityId = await findOrCreateSousActivity(
                  dataSource,
                  sousCode,
                  sousActivityName,
                  activityId,
                  departmentId
                );
              }

              // Create tache if exists (even if code is '0')
              if (tacheCode && tacheName) {
                tacheId = await findOrCreateTache(
                  dataSource,
                  tacheCode,
                  tacheName,
                  sousActivityId,
                  activityId,
                  departmentId
                );
              }

              // Upsert budget record
              await insertBudgetRecord(dataSource, row, departmentId, activityId, sousActivityId, tacheId);
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

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(80));
  console.log('Import Budget Summary CSVs - Version 2 (UPSERT Mode)');
  console.log('='.repeat(80));

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected\n');

    const budgetSummaryFolder = path.join(__dirname, '../data/budget_summary');

    if (!fs.existsSync(budgetSummaryFolder)) {
      throw new Error(`Folder not found: ${budgetSummaryFolder}`);
    }

    const files = fs.readdirSync(budgetSummaryFolder).filter(f => f.endsWith('.csv'));
    console.log(`Found ${files.length} CSV files to process\n`);

    // Process one file at a time
    for (const file of files) {
      const filePath = path.join(budgetSummaryFolder, file);
      await processCSVFile(AppDataSource, filePath, file);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✓ Import completed successfully!');
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
