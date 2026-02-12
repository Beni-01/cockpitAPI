import 'reflect-metadata';
import ds from '../db/typeorm.config';

async function run() {
  try {
    console.log('Initializing datasource...');
    if (!ds.isInitialized) await ds.initialize();

    console.log('Updating transaction.centreId from transactions_backup_with_cost_center -> budget');

    // Ensure backup table and budget exist
    const tableCheck = await ds.query("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'transactions_backup_with_cost_center'");
    const tableExists = !!(tableCheck && tableCheck[0] && Number(Object.values(tableCheck[0])[0]) > 0);
    if (!tableExists) {
      console.error('transactions_backup_with_cost_center does not exist. Run scripts/backup-transactions-with-cost-center.ts first.');
      process.exitCode = 1;
      return;
    }

    // Update transactions by matching backup.cont_center -> budget.cost_center
    const updateSql = `
      UPDATE transaction t
      JOIN transactions_backup_with_cost_center bup ON t.id = bup.id
      JOIN budget b ON bup.cont_center = b.cost_center
      SET t.centreId = b.id
      WHERE bup.cont_center IS NOT NULL AND (t.centreId IS NULL OR t.centreId <> b.id);
    `;

    const res: any = await ds.query(updateSql);

    // For mysql/mysql2 driver the result has affectedRows; for sqlite it may differ
    const affected = res && (res.affectedRows ?? res.affected ?? res.changedRows ?? null);
    console.log(`Update completed. Affected rows: ${affected ?? JSON.stringify(res)}`);

    // Optional: report mismatches where cont_center exists but no budget found
    const orphanSql = `
      SELECT DISTINCT bup.cont_center
      FROM transactions_backup_with_cost_center bup
      LEFT JOIN budget b ON bup.cont_center = b.cost_center
      WHERE bup.cont_center IS NOT NULL AND b.id IS NULL
      LIMIT 100;
    `;
    const orphans = await ds.query(orphanSql);
    if (orphans && orphans.length > 0) {
      console.warn('Found cont_center values with no matching budget.cost_center (sample up to 100):');
      console.warn(orphans.map((r: any) => Object.values(r)[0]));
    } else {
      console.log('No orphan cont_center values found.');
    }

    // Safe index creation: check information_schema first (older MySQL doesn't support IF NOT EXISTS)
    const idxCheck = await ds.query("SELECT COUNT(*) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'transactions_backup_with_cost_center' AND index_name = 'idx_transactions_backup_cont_center'");
    const hasIdx = !!(idxCheck && idxCheck[0] && Number(Object.values(idxCheck[0])[0]) > 0);
    if (!hasIdx) {
      try {
        await ds.query('CREATE INDEX idx_transactions_backup_cont_center ON `transactions_backup_with_cost_center` (cont_center);');
        console.log('Index idx_transactions_backup_cont_center created.');
      } catch (e) {
        console.warn('Could not create index idx_transactions_backup_cont_center:', e.message || e);
      }
    } else {
      console.log('Index idx_transactions_backup_cont_center already exists.');
    }

  } catch (err) {
    console.error('Fix failed:', err);
    process.exitCode = 1;
  } finally {
    if (ds.isInitialized) await ds.destroy();
  }
}

run();
