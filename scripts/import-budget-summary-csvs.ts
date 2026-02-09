import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

/**
 * Import Budget Summary CSVs
 * 
 * Reads CSV files from data/budget_summary folder
 * Parses description_cc column pattern: department_activity_sousActivity_tache
 * Creates hierarchical relationships: Department -> Activity -> Sous Activity -> Tache -> Budget
 * 
 * IMPORTANT: Same activity names can exist for different departments
 */

interface BudgetRow {
  cost_center?: string;
  description_cc?: string;
  province_ville?: string;
  coordinations_provinciales?: string;
  local_etranger?: string;
  categorie_grade?: string;
  nature_depenses?: string;
  account_ohada?: string;
  departement?: string;
  texte_libelle?: string;
  unite_mesure?: string;
  cout_unitaire_usd?: string;
  jan?: string;
  feb?: string;
  mar?: string;
  apr?: string;
  may?: string;
  jun?: string;
  jul?: string;
  aug?: string;
  sep?: string;
  oct?: string;
  nov?: string;
  dec?: string;
  total_units?: string;
  total_budget_usd?: string;
}

// Initialize data source
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'f360',
});

async function parseDepartmentFromFilename(filename: string): Promise<string> {
  // Extract department from filename: "Fonarev_Budget_Accès à la Justice - Summary.csv"
  // Returns: "Accès à la Justice"
  const match = filename.match(/Fonarev_Budget_(.+?) - Summary\.csv$/i);
  if (match) {
    return match[1].trim();
  }
  return filename.replace(/Fonarev_Budget_/i, '').replace(/ - Summary\.csv$/i, '').trim();
}

async function parseDescriptionHierarchy(description: string): Promise<{
  activityName: string | null;
  sousActivityName: string | null;
  tacheName: string | null;
}> {
  // Pattern: department_activity_sousActivity_tache
  // Or variations with fewer levels
  
  if (!description || description.trim() === '') {
    return { activityName: null, sousActivityName: null, tacheName: null };
  }

  const parts = description.split('_').map(p => p.trim()).filter(p => p !== '');
  
  // Remove department name from parts (first part is usually department)
  const [, ...hierarchyParts] = parts;

  let activityName: string | null = null;
  let sousActivityName: string | null = null;
  let tacheName: string | null = null;

  if (hierarchyParts.length >= 1) {
    activityName = hierarchyParts[0];
  }
  if (hierarchyParts.length >= 2) {
    sousActivityName = hierarchyParts[1];
  }
  if (hierarchyParts.length >= 3) {
    tacheName = hierarchyParts.slice(2).join('_'); // Remaining parts are tache
  }

  return { activityName, sousActivityName, tacheName };
}

async function findOrCreateDepartment(dataSource: DataSource, departmentName: string): Promise<number> {
  // Check if department exists
  const existing = await dataSource.query(
    'SELECT id, code FROM department WHERE name = ? LIMIT 1',
    [departmentName]
  );

  if (existing && existing.length > 0) {
    console.log(`  ✓ Found department: ${departmentName} (ID: ${existing[0].id})`);
    return existing[0].id;
  }

  // Create department code from name
  const code = departmentName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 10)
    .toUpperCase();

  const result = await dataSource.query(
    'INSERT INTO department (code, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [code, departmentName]
  );

  console.log(`  ✓ Created department: ${departmentName} (ID: ${result.insertId})`);
  return result.insertId;
}

async function findOrCreateActivity(
  dataSource: DataSource,
  activityName: string,
  departmentId: number
): Promise<number> {
  // IMPORTANT: Check by name AND department_id (same name can exist for different departments)
  const existing = await dataSource.query(
    'SELECT id FROM budget_activity WHERE name = ? AND department_id = ? LIMIT 1',
    [activityName, departmentId]
  );

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // Create activity code from name
  const code = activityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);

  const result = await dataSource.query(
    'INSERT INTO budget_activity (name, code, department_id) VALUES (?, ?, ?)',
    [activityName, code, departmentId]
  );

  console.log(`    ✓ Created activity: ${activityName} for dept ${departmentId}`);
  return result.insertId;
}

async function findOrCreateSousActivity(
  dataSource: DataSource,
  sousActivityName: string,
  activityId: number,
  departmentId: number
): Promise<number> {
  // IMPORTANT: Check by name, activity_id AND department_id
  const existing = await dataSource.query(
    'SELECT id FROM budget_sous_activity WHERE name = ? AND activity_id = ? AND department_id = ? LIMIT 1',
    [sousActivityName, activityId, departmentId]
  );

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  const code = sousActivityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);

  const result = await dataSource.query(
    'INSERT INTO budget_sous_activity (name, code, activity_id, department_id) VALUES (?, ?, ?, ?)',
    [sousActivityName, code, activityId, departmentId]
  );

  console.log(`      ✓ Created sous_activity: ${sousActivityName}`);
  return result.insertId;
}

async function findOrCreateTache(
  dataSource: DataSource,
  tacheName: string,
  sousActivityId: number | null,
  activityId: number | null,
  departmentId: number
): Promise<number> {
  // IMPORTANT: Check by name AND department_id
  const existing = await dataSource.query(
    'SELECT id FROM budget_tache WHERE name = ? AND department_id = ? LIMIT 1',
    [tacheName, departmentId]
  );

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  const code = tacheName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);

  const result = await dataSource.query(
    `INSERT INTO budget_tache (name, cost_code, sous_activity_id, activity_id, department_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [tacheName, code, sousActivityId, activityId, departmentId]
  );

  console.log(`        ✓ Created tache: ${tacheName}`);
  return result.insertId;
}

async function insertBudgetRecord(
  dataSource: DataSource,
  row: BudgetRow,
  departmentId: number,
  activityId: number | null,
  sousActivityId: number | null,
  tacheId: number | null
): Promise<void> {
  const query = `
    INSERT INTO budget (
      cost_center, description_cc, province_ville, coordinations_provinciales,
      local_etranger, categorie_grade, nature_depenses, account_ohada,
      departement, texte_libelle, unite_mesure, cout_unitaire_usd,
      jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, \`dec\`,
      total_units, total_budget_usd,
      department_id, activity_id, sous_activity_id, tache_id,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    row.cost_center || null,
    row.description_cc || null,
    row.province_ville || null,
    row.coordinations_provinciales || null,
    row.local_etranger || null,
    row.categorie_grade || null,
    row.nature_depenses || null,
    row.account_ohada || null,
    row.departement || null,
    row.texte_libelle || null,
    row.unite_mesure || null,
    row.cout_unitaire_usd ? parseFloat(row.cout_unitaire_usd) : null,
    row.jan ? parseFloat(row.jan) : null,
    row.feb ? parseFloat(row.feb) : null,
    row.mar ? parseFloat(row.mar) : null,
    row.apr ? parseFloat(row.apr) : null,
    row.may ? parseFloat(row.may) : null,
    row.jun ? parseFloat(row.jun) : null,
    row.jul ? parseFloat(row.jul) : null,
    row.aug ? parseFloat(row.aug) : null,
    row.sep ? parseFloat(row.sep) : null,
    row.oct ? parseFloat(row.oct) : null,
    row.nov ? parseFloat(row.nov) : null,
    row.dec ? parseFloat(row.dec) : null,
    row.total_units ? parseFloat(row.total_units) : null,
    row.total_budget_usd ? parseFloat(row.total_budget_usd) : null,
    departmentId,
    activityId,
    sousActivityId,
    tacheId,
  ];

  await dataSource.query(query, values);
}

async function processCSVFile(dataSource: DataSource, filePath: string, filename: string): Promise<void> {
  console.log(`\n📄 Processing: ${filename}`);

  // Get department from filename
  const departmentName = await parseDepartmentFromFilename(filename);
  console.log(`  Department: ${departmentName}`);

  const departmentId = await findOrCreateDepartment(dataSource, departmentName);

  const rows: BudgetRow[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: BudgetRow) => {
        rows.push(row);
      })
      .on('end', async () => {
        try {
          console.log(`  Found ${rows.length} rows in CSV`);
          let imported = 0;
          let skipped = 0;

          for (const row of rows) {
            // Parse hierarchy from description_cc
            const { activityName, sousActivityName, tacheName } = await parseDescriptionHierarchy(
              row.description_cc || ''
            );

            let activityId: number | null = null;
            let sousActivityId: number | null = null;
            let tacheId: number | null = null;

            // Create activity if exists
            if (activityName) {
              activityId = await findOrCreateActivity(dataSource, activityName, departmentId);
            }

            // Create sous_activity if exists
            if (sousActivityName && activityId) {
              sousActivityId = await findOrCreateSousActivity(
                dataSource,
                sousActivityName,
                activityId,
                departmentId
              );
            }

            // Create tache if exists
            if (tacheName) {
              tacheId = await findOrCreateTache(
                dataSource,
                tacheName,
                sousActivityId,
                activityId,
                departmentId
              );
            }

            // Insert budget record
            try {
              await insertBudgetRecord(dataSource, row, departmentId, activityId, sousActivityId, tacheId);
              imported++;
            } catch (error) {
              console.error(`    ✗ Error inserting budget record:`, error.message);
              skipped++;
            }
          }

          console.log(`  ✓ Imported: ${imported} records, Skipped: ${skipped}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('Import Budget Summary CSVs');
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
