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

    console.log('Updating backup.centreId by matching cont_center -> budget_tache.cost_code -> budget.tache_id');

    // Diagnostics before update
    const cntBackupWithCont = await ds.query("SELECT COUNT(*) AS cnt FROM transactions_backup_with_cost_center WHERE cont_center IS NOT NULL");
    const cntBackupContNoCentreId = await ds.query("SELECT COUNT(*) AS cnt FROM transactions_backup_with_cost_center WHERE cont_center IS NOT NULL AND centreId IS NULL");
    console.log('Backup rows with cont_center:', (cntBackupWithCont && cntBackupWithCont[0]) ? Object.values(cntBackupWithCont[0])[0] : 0);
    console.log('Backup rows with cont_center and missing centreId:', (cntBackupContNoCentreId && cntBackupContNoCentreId[0]) ? Object.values(cntBackupContNoCentreId[0])[0] : 0);

    const updateBackup = `
      UPDATE transactions_backup_with_cost_center bup
      JOIN budget_tache t ON bup.cont_center = t.cost_code
      JOIN budget b ON b.tache_id = t.id
      SET bup.centreId = b.id
      WHERE bup.cont_center IS NOT NULL AND bup.centreId IS NULL
    `;
    const upRes: any = await ds.query(updateBackup);
    console.log('Update backup result:', upRes && (upRes.affectedRows ?? upRes.affected ?? upRes.changedRows ?? JSON.stringify(upRes)));

    console.log('Propagate centreId back to original transaction table where missing');
    const propagate = `
      UPDATE transaction t
      JOIN transactions_backup_with_cost_center bup ON t.id = bup.id
      SET t.centreId = bup.centreId
      WHERE bup.cont_center IS NOT NULL AND t.centreId IS NULL AND bup.centreId IS NOT NULL
    `;
    const res: any = await ds.query(propagate);
    const affected = res && (res.affectedRows ?? res.affected ?? res.changedRows ?? null);
    console.log(`Propagate completed. Affected rows: ${affected ?? JSON.stringify(res)}`);

    // Safe index creation
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

    console.log('Fix complete.');
  } catch (err) {
    console.error('Failed to fix transactions centreId from tache:', err);
    process.exitCode = 1;
  } finally {
    if (ds.isInitialized) await ds.destroy();
  }
}

run();
