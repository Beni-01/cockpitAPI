import 'reflect-metadata';
import ds from '../db/typeorm.config';

async function run() {
  try {
    console.log('Initializing datasource...');
    if (!ds.isInitialized) await ds.initialize();

    const tableCheck = await ds.query("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'transactions_backup_with_cost_center'");
    const tableExists = !!(tableCheck && tableCheck[0] && Number(Object.values(tableCheck[0])[0]) > 0);
    if (!tableExists) {
      console.error('Backup table transactions_backup_with_cost_center does not exist. Run scripts/backup-transactions-with-cost-center.ts first.');
      process.exitCode = 1;
      return;
    }

    console.log('Attempting case-insensitive match: backup.cont_center -> budget.cost_center');

    // Diagnostics before
    const preCnt = await ds.query("SELECT COUNT(*) AS cnt FROM transaction t WHERE t.centreId IS NULL");
    console.log('Transactions with NULL centreId before:', preCnt && preCnt[0] ? Object.values(preCnt[0])[0] : 0);

    // Update backup.centreId by matching trimmed, lowercased cont_center to cost_center
    const updateBackup = `
      UPDATE transactions_backup_with_cost_center bup
      JOIN budget b ON LOWER(TRIM(bup.cont_center)) = LOWER(TRIM(b.cost_center))
      SET bup.centreId = b.id
      WHERE bup.cont_center IS NOT NULL AND (bup.centreId IS NULL OR bup.centreId <> b.id)
    `;
    const upRes: any = await ds.query(updateBackup);
    console.log('Update backup result (matched by cost_center):', upRes && (upRes.affectedRows ?? upRes.affected ?? upRes.changedRows ?? JSON.stringify(upRes)));

    // Propagate to transaction table
    const propagate = `
      UPDATE transaction t
      JOIN transactions_backup_with_cost_center bup ON t.id = bup.id
      SET t.centreId = bup.centreId
      WHERE bup.cont_center IS NOT NULL AND t.centreId IS NULL AND bup.centreId IS NOT NULL
    `;
    const propRes: any = await ds.query(propagate);
    const affected = propRes && (propRes.affectedRows ?? propRes.affected ?? propRes.changedRows ?? null);
    console.log(`Propagate completed. Affected rows: ${affected ?? JSON.stringify(propRes)}`);

    // Report cont_center values still unmatched
    const orphanSql = `
      SELECT DISTINCT bup.cont_center
      FROM transactions_backup_with_cost_center bup
      LEFT JOIN budget b ON LOWER(TRIM(bup.cont_center)) = LOWER(TRIM(b.cost_center))
      WHERE bup.cont_center IS NOT NULL AND b.id IS NULL
      LIMIT 200
    `;
    const orphans = await ds.query(orphanSql);
    console.log('Unmatched cont_center sample (up to 200):', (orphans || []).map((r: any) => Object.values(r)[0]));

    console.log('Done.');
  } catch (err) {
    console.error('Failed to fix transactions centreId from cost_center:', err);
    process.exitCode = 1;
  } finally {
    if (ds.isInitialized) await ds.destroy();
  }
}

run();
