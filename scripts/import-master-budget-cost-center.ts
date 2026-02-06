import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

// Load environment variables
config();

/**
 * Import Master Budget - Cost Center CSV
 * 
 * Processes both OPEX and CAPEX columns
 * - OPEX: columns 2-9 (Department, Activity, Sous Activity, Tache + codes)
 * - CAPEX: columns 15-22 (Department, Activity, Sous Activity, Tache + codes)
 * 
 * Special rule: If CAPEX department is "FINANCE", rename to "CAPEX"
 * 
 * UPSERT Logic:
 * - Departments: Update by code if exists
 * - Activities: Update by code + department_id if exists
 * - Sous Activities: Update by code + department_id if exists
 * - Taches: Update by code + department_id if exists
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

interface CostCenterRow {
  [key: string]: any;
}

/**
 * Upsert department (update if exists by code, insert if not)
 */
async function upsertDepartment(
  dataSource: DataSource,
  code: string,
  name: string
): Promise<number> {
  if (!code || !name) {
    throw new Error('Department code and name are required');
  }

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
      console.log(`  ✓ Updated department: ${name} (${code})`);
    }
    
    return existingId;
  }

  // Create new department
  const result = await dataSource.query(
    'INSERT INTO department (code, name) VALUES (?, ?)',
    [code, name]
  );

  console.log(`  ✓ Created department: ${name} (${code})`);
  return result.insertId;
}

/**
 * Upsert activity (update if exists by code+department, insert if not)
 */
async function upsertActivity(
  dataSource: DataSource,
  code: string,
  name: string,
  departmentId: number
): Promise<number> {
  if (!code || !name) {
    throw new Error('Activity code and name are required');
  }

  // Check by code AND department_id
  let existing = await dataSource.query(
    'SELECT id, name FROM budget_activity WHERE code = ? AND department_id = ? LIMIT 1',
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
async function upsertTache(
  dataSource: DataSource,
  code: string,
  name: string,
  sousActivityId: number | null,
  activityId: number | null,
  departmentId: number
): Promise<number> {
  if (!code || !name) {
    throw new Error('Tache code and name are required');
  }

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
 * Process a single hierarchy entry
 */
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
  tacheCode: string
): Promise<void> {
  // Special rule: If CAPEX and department is "FINANCE", rename to "CAPEX"
  if (type === 'CAPEX' && deptName?.trim().toUpperCase() === 'FINANCE') {
    deptName = 'CAPEX';
  }

  // Skip if no department
  if (!deptCode || !deptName) {
    return;
  }

  // Upsert department
  const departmentId = await upsertDepartment(dataSource, deptCode.trim(), deptName.trim());

  let activityId: number | null = null;
  let sousActivityId: number | null = null;

  // Upsert activity if exists
  if (activityCode && activityName) {
    activityId = await upsertActivity(
      dataSource,
      activityCode.trim(),
      activityName.trim(),
      departmentId
    );
  }

  // Upsert sous_activity if exists
  if (sousActivityCode && sousActivityName && activityId) {
    sousActivityId = await upsertSousActivity(
      dataSource,
      sousActivityCode.trim(),
      sousActivityName.trim(),
      activityId,
      departmentId
    );
  }

  // Upsert tache if exists
  if (tacheCode && tacheName) {
    await upsertTache(
      dataSource,
      tacheCode.trim(),
      tacheName.trim(),
      sousActivityId,
      activityId,
      departmentId
    );
  }
}

/**
 * Process the CSV file
 */
async function processCSVFile(dataSource: DataSource, filePath: string): Promise<void> {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);

  const rows: CostCenterRow[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ skipLines: 1 })) // Skip first row (OPEX/CAPEX header)
      .on('data', (row: any) => {
        rows.push(row);
      })
      .on('end', async () => {
        try {
          console.log(`  Found ${rows.length} rows\n`);
          
          const processedDepts = new Set<string>();
          let opexProcessed = 0;
          let capexProcessed = 0;

          for (const row of rows) {
            try {
              // Get column names from the row keys
              const keys = Object.keys(row);

              // OPEX columns (indices 2-9 in original, but csv-parser uses column names)
              const opexDept = row[keys[2]]?.trim();
              const opexActivity = row[keys[3]]?.trim();
              const opexSousActivity = row[keys[4]]?.trim();
              const opexTache = row[keys[5]]?.trim();
              const opexDeptCode = row[keys[6]]?.trim();
              const opexActivityCode = row[keys[7]]?.trim();
              const opexSousActivityCode = row[keys[8]]?.trim();
              const opexTacheCode = row[keys[9]]?.trim();

              // CAPEX columns (indices 15-22 in original)
              const capexDept = row[keys[15]]?.trim();
              const capexActivity = row[keys[16]]?.trim();
              const capexSousActivity = row[keys[17]]?.trim();
              const capexTache = row[keys[18]]?.trim();
              const capexDeptCode = row[keys[19]]?.trim();
              const capexActivityCode = row[keys[20]]?.trim();
              const capexSousActivityCode = row[keys[21]]?.trim();
              const capexTacheCode = row[keys[22]]?.trim();

              // Process OPEX if data exists
              if (opexDeptCode && opexDept) {
                const key = `OPEX-${opexDeptCode}-${opexActivityCode}-${opexSousActivityCode}-${opexTacheCode}`;
                if (!processedDepts.has(key)) {
                  await processHierarchy(
                    dataSource,
                    'OPEX',
                    opexDept,
                    opexActivity,
                    opexSousActivity,
                    opexTache,
                    opexDeptCode,
                    opexActivityCode,
                    opexSousActivityCode,
                    opexTacheCode
                  );
                  processedDepts.add(key);
                  opexProcessed++;
                }
              }

              // Process CAPEX if data exists
              if (capexDeptCode && capexDept) {
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
                    capexTacheCode
                  );
                  processedDepts.add(key);
                  capexProcessed++;
                }
              }

            } catch (error) {
              console.error(`    ✗ Error processing row:`, error.message);
            }
          }

          console.log(`\n  ✓ Processed: ${opexProcessed} OPEX entries, ${capexProcessed} CAPEX entries`);
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
  console.log('Import Master Budget - Cost Center (UPSERT Mode)');
  console.log('='.repeat(80));

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    const csvPath = path.join(__dirname, '../data/Master Budget - Cost Center (1).csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`File not found: ${csvPath}`);
    }

    await processCSVFile(AppDataSource, csvPath);

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
