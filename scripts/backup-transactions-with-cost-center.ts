import 'reflect-metadata';
import ds from '../db/typeorm.config';

async function run() {
  try {
    console.log('Initializing datasource...');
    if (!ds.isInitialized) await ds.initialize();

    console.log('Ensuring backup table exists and syncing cont_center (no DROP)...');

    // Check if backup table exists
    const tableCheck = await ds.query("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'transactions_backup_with_cost_center'");
    const tableExists = !!(tableCheck && tableCheck[0] && Number(Object.values(tableCheck[0])[0]) > 0);

    if (!tableExists) {
      console.log('Creating transactions_backup_with_cost_center (first time) ...');
      const createSql = `
        CREATE TABLE transactions_backup_with_cost_center AS
        SELECT
          t.*,
          b.cost_center AS cont_center
        FROM transaction t
        LEFT JOIN budget b
          ON t.centreId = b.id;
      `;
      await ds.query(createSql);

      // Try to add primary key on id to make future upserts efficient (ignore errors)
      try {
        await ds.query('ALTER TABLE transactions_backup_with_cost_center ADD PRIMARY KEY (id);');
      } catch (e) {
        // ignore -- primary key may already exist or id may not be suitable
      }

      console.log('Initial backup created: transactions_backup_with_cost_center');
    } else {
      console.log('transactions_backup_with_cost_center exists — updating existing rows and inserting missing ones');

      // Ensure cont_center column exists in backup
      const colCheck = await ds.query("SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transactions_backup_with_cost_center' AND column_name = 'cont_center'");
      const hasContCenter = !!(colCheck && colCheck[0] && Number(Object.values(colCheck[0])[0]) > 0);
      if (!hasContCenter) {
        try {
          await ds.query('ALTER TABLE transactions_backup_with_cost_center ADD COLUMN cont_center VARCHAR(255) NULL;');
        } catch (e) {
          // ignore if cannot add
        }
      }

      // Update cont_center for rows that already exist in the backup
      const updateSql = `
        UPDATE transactions_backup_with_cost_center b
        JOIN transaction t ON b.id = t.id
        LEFT JOIN budget bb ON t.centreId = bb.id
        SET b.cont_center = bb.cost_center
        WHERE (b.cont_center IS NULL OR b.cont_center <> bb.cost_center);
      `;
      await ds.query(updateSql);

      // Insert any missing transactions into the backup
      const insertSql = `
        INSERT INTO transactions_backup_with_cost_center
        SELECT t.*, b.cost_center AS cont_center
        FROM transaction t
        LEFT JOIN budget b ON t.centreId = b.id
        WHERE NOT EXISTS (
          SELECT 1 FROM transactions_backup_with_cost_center bkp WHERE bkp.id = t.id
        );
      `;
      await ds.query(insertSql);

      console.log('Sync complete: transactions_backup_with_cost_center updated and missing rows inserted');
    }
  } catch (err) {
    console.error('Backup failed:', err);
    process.exitCode = 1;
  } finally {
    if (ds.isInitialized) await ds.destroy();
  }
}

run();
