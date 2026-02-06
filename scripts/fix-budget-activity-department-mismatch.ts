import { DataSource } from 'typeorm';
import * as path from 'path';

/**
 * Script to identify and fix budget records where activity_id or sous_activity_id
 * don't match the department_id
 */

async function fixActivityDepartmentMismatch() {
  // Initialize data source
  const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'f360',
    entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
  });

  await AppDataSource.initialize();
  console.log('Database connected');

  try {
    // Find budget records where activity_id's department doesn't match budget's department
    const activityMismatches = await AppDataSource.query(`
      SELECT 
        b.id as budget_id,
        b.department_id as budget_dept_id,
        b.activity_id,
        ba.department_id as activity_dept_id,
        ba.name as activity_name,
        d1.code as budget_dept_code,
        d1.name as budget_dept_name,
        d2.code as activity_dept_code,
        d2.name as activity_dept_name
      FROM budget b
      INNER JOIN budget_activity ba ON b.activity_id = ba.id
      LEFT JOIN department d1 ON b.department_id = d1.id
      LEFT JOIN department d2 ON ba.department_id = d2.id
      WHERE b.activity_id IS NOT NULL 
        AND b.department_id IS NOT NULL
        AND ba.department_id IS NOT NULL
        AND b.department_id != ba.department_id
      ORDER BY b.department_id, b.activity_id
      LIMIT 100
    `);

    console.log(`\n=== ACTIVITY MISMATCHES FOUND: ${activityMismatches.length} ===`);
    if (activityMismatches.length > 0) {
      console.table(activityMismatches);
    }

    // Find budget records where sous_activity_id's department doesn't match budget's department
    const sousActivityMismatches = await AppDataSource.query(`
      SELECT 
        b.id as budget_id,
        b.department_id as budget_dept_id,
        b.sous_activity_id,
        bsa.department_id as sous_activity_dept_id,
        bsa.name as sous_activity_name,
        d1.code as budget_dept_code,
        d1.name as budget_dept_name,
        d2.code as sous_activity_dept_code,
        d2.name as sous_activity_dept_name
      FROM budget b
      INNER JOIN budget_sous_activity bsa ON b.sous_activity_id = bsa.id
      LEFT JOIN department d1 ON b.department_id = d1.id
      LEFT JOIN department d2 ON bsa.department_id = d2.id
      WHERE b.sous_activity_id IS NOT NULL 
        AND b.department_id IS NOT NULL
        AND bsa.department_id IS NOT NULL
        AND b.department_id != bsa.department_id
      ORDER BY b.department_id, b.sous_activity_id
      LIMIT 100
    `);

    console.log(`\n=== SOUS_ACTIVITY MISMATCHES FOUND: ${sousActivityMismatches.length} ===`);
    if (sousActivityMismatches.length > 0) {
      console.table(sousActivityMismatches);
    }

    // Ask for confirmation before fixing
    console.log('\n=== PROPOSED FIX ===');
    console.log('Option 1: Set activity_id and sous_activity_id to NULL where they don\'t match the department');
    console.log('Option 2: Update department_id to match the activity/sous_activity department');
    console.log('\nTo execute fix, uncomment the appropriate section below and run again.\n');

    // OPTION 1: Nullify mismatched activity/sous_activity IDs (UNCOMMENT TO RUN)
    /*
    if (activityMismatches.length > 0) {
      const result1 = await AppDataSource.query(`
        UPDATE budget b
        INNER JOIN budget_activity ba ON b.activity_id = ba.id
        SET b.activity_id = NULL
        WHERE b.activity_id IS NOT NULL 
          AND b.department_id IS NOT NULL
          AND ba.department_id IS NOT NULL
          AND b.department_id != ba.department_id
      `);
      console.log(`✓ Nullified ${result1.affectedRows} activity_id mismatches`);
    }

    if (sousActivityMismatches.length > 0) {
      const result2 = await AppDataSource.query(`
        UPDATE budget b
        INNER JOIN budget_sous_activity bsa ON b.sous_activity_id = bsa.id
        SET b.sous_activity_id = NULL
        WHERE b.sous_activity_id IS NOT NULL 
          AND b.department_id IS NOT NULL
          AND bsa.department_id IS NOT NULL
          AND b.department_id != bsa.department_id
      `);
      console.log(`✓ Nullified ${result2.affectedRows} sous_activity_id mismatches`);
    }
    */

    // OPTION 2: Update department_id to match activity (UNCOMMENT TO RUN)
    /*
    if (activityMismatches.length > 0) {
      const result3 = await AppDataSource.query(`
        UPDATE budget b
        INNER JOIN budget_activity ba ON b.activity_id = ba.id
        SET b.department_id = ba.department_id
        WHERE b.activity_id IS NOT NULL 
          AND b.department_id IS NOT NULL
          AND ba.department_id IS NOT NULL
          AND b.department_id != ba.department_id
      `);
      console.log(`✓ Updated ${result3.affectedRows} budget department_id to match activity`);
    }
    */

    // Show specific examples for department 4
    console.log('\n=== DEPARTMENT 4 SPECIFIC ISSUES ===');
    const dept4Issues = await AppDataSource.query(`
      SELECT 
        b.id,
        b.department_id,
        b.activity_id,
        ba.name as activity_name,
        ba.department_id as activity_dept_id,
        b.sous_activity_id,
        bsa.name as sous_activity_name,
        bsa.department_id as sous_activity_dept_id,
        b.tache_id,
        b.total_budget_usd
      FROM budget b
      LEFT JOIN budget_activity ba ON b.activity_id = ba.id
      LEFT JOIN budget_sous_activity bsa ON b.sous_activity_id = bsa.id
      WHERE b.department_id = 4
        AND (
          (b.activity_id IS NOT NULL AND ba.department_id != 4)
          OR
          (b.sous_activity_id IS NOT NULL AND bsa.department_id != 4)
        )
      ORDER BY b.id
      LIMIT 50
    `);

    if (dept4Issues.length > 0) {
      console.log(`Found ${dept4Issues.length} issues in department 4:`);
      console.table(dept4Issues);
    } else {
      console.log('No issues found in department 4');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('\nDatabase connection closed');
  }
}

fixActivityDepartmentMismatch()
  .then(() => {
    console.log('\n✓ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
