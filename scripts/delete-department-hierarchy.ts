import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as readline from 'readline';

config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'F360DB',
});

async function promptConfirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      const a = (answer || '').toLowerCase().trim();
      resolve(a === 'y' || a === 'yes');
    });
  });
}

async function deleteDepartmentHierarchy(dataSource: DataSource, deptId: number, dryRun = true) {
  // Count affected rows
  const budgetCountRes: any = await dataSource.query(
    `SELECT COUNT(*) as c FROM budget WHERE department_id = ? OR assigned_department_id = ? OR activity_id IN (SELECT id FROM budget_activity WHERE department_id = ?) OR sous_activity_id IN (SELECT id FROM budget_sous_activity WHERE department_id = ?) OR tache_id IN (SELECT id FROM budget_tache WHERE department_id = ?)`,
    [deptId, deptId, deptId, deptId, deptId]
  );

  const tacheCountRes: any = await dataSource.query(
    `SELECT COUNT(*) as c FROM budget_tache WHERE department_id = ? OR activity_id IN (SELECT id FROM budget_activity WHERE department_id = ?) OR sous_activity_id IN (SELECT id FROM budget_sous_activity WHERE department_id = ?)`,
    [deptId, deptId, deptId]
  );

  const sousCountRes: any = await dataSource.query(
    `SELECT COUNT(*) as c FROM budget_sous_activity WHERE department_id = ? OR activity_id IN (SELECT id FROM budget_activity WHERE department_id = ?)`,
    [deptId, deptId]
  );

  const activityCountRes: any = await dataSource.query(
    `SELECT COUNT(*) as c FROM budget_activity WHERE department_id = ?`,
    [deptId]
  );

  console.log(`Department ID ${deptId} -> budgets: ${budgetCountRes[0].c}, taches: ${tacheCountRes[0].c}, sous_activities: ${sousCountRes[0].c}, activities: ${activityCountRes[0].c}`);

  if (dryRun) return;

  // Delete in a transaction
  await dataSource.manager.transaction(async (tm) => {
    await tm.query(
      `DELETE FROM budget WHERE department_id = ? OR assigned_department_id = ? OR activity_id IN (SELECT id FROM budget_activity WHERE department_id = ?) OR sous_activity_id IN (SELECT id FROM budget_sous_activity WHERE department_id = ?) OR tache_id IN (SELECT id FROM budget_tache WHERE department_id = ?)`,
      [deptId, deptId, deptId, deptId, deptId]
    );

    await tm.query(
      `DELETE FROM budget_tache WHERE department_id = ? OR activity_id IN (SELECT id FROM budget_activity WHERE department_id = ?) OR sous_activity_id IN (SELECT id FROM budget_sous_activity WHERE department_id = ?)`,
      [deptId, deptId, deptId]
    );

    await tm.query(
      `DELETE FROM budget_sous_activity WHERE department_id = ? OR activity_id IN (SELECT id FROM budget_activity WHERE department_id = ?)`,
      [deptId, deptId]
    );

    await tm.query(
      `DELETE FROM budget_activity WHERE department_id = ?`,
      [deptId]
    );

    await tm.query(
      `DELETE FROM department WHERE id = ?`,
      [deptId]
    );
  });

  console.log(`Deleted hierarchy for department id ${deptId}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const yes = args.includes('--yes');
  const all = args.includes('--all');
  const codes = args.filter(a => a !== '--dry' && a !== '--yes' && a !== '--all');

  if (!all && codes.length === 0) {
    console.error('Usage: npx ts-node scripts/delete-department-hierarchy.ts <DEPT_CODE> [<DEPT_CODE> ...] [--dry] [--yes] [--all]');
    process.exit(1);
  }

  await AppDataSource.initialize();

  if (all) {
    // load every department code
    const allDeps: any = await AppDataSource.query('SELECT code FROM department');
    const loaded = (allDeps || []).map((r: any) => r.code).filter(Boolean);
    if (loaded.length === 0) {
      console.log('No departments found in database.');
      await AppDataSource.destroy();
      process.exit(0);
    }
    // replace codes list with loaded codes
    codes.length = 0;
    loaded.forEach((c: string) => codes.push(c));
  }

  try {
    for (const code of codes) {
      const deptRes: any = await AppDataSource.query('SELECT id, code, name FROM department WHERE code = ? LIMIT 1', [code]);
      if (!deptRes || deptRes.length === 0) {
        console.warn(`Department not found for code: ${code}`);
        continue;
      }

      const dept = deptRes[0];
      console.log(`Found department: ${dept.name} (${dept.code}) id=${dept.id}`);

      if (!yes) {
        const ok = await promptConfirm(dry ? `Dry-run: show counts for ${dept.code}. Proceed to show counts? (y/N): ` : `About to DELETE hierarchy for ${dept.code}. Are you sure? (y/N): `);
        if (!ok) {
          console.log('Skipped');
          continue;
        }
      }

      await deleteDepartmentHierarchy(AppDataSource, dept.id, dry);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
