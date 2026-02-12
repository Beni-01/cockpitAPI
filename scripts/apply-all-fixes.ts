import 'reflect-metadata';
import ds from '../db/typeorm.config';

async function run() {
  try {
    console.log('Initializing datasource...');
    if (!ds.isInitialized) await ds.initialize();

    const qr = ds.createQueryRunner();

    console.log('Checking google_sheet_config.range column...');
    const hasRange = await qr.hasColumn('google_sheet_config', 'range');
    if (!hasRange) {
      console.log('Adding range column to google_sheet_config...');
      await qr.query("ALTER TABLE `google_sheet_config` ADD COLUMN `range` VARCHAR(255) NULL;");
    } else {
      console.log('Column range already exists.');
    }

    console.log('Dropping existing backup table if any...');
    await qr.query('DROP TABLE IF EXISTS `transactions_backup_with_cost_center`;');

    console.log('Creating transactions backup with cont_center from budget...');
    await qr.query(`
      CREATE TABLE transactions_backup_with_cost_center AS
      SELECT
        t.*,
        b.cost_center AS cont_center
      FROM transaction t
      LEFT JOIN budget b
        ON t.centreId = b.id
    `);

    console.log('Creating index on cont_center (if not exists)...');
    try {
      await qr.query('CREATE INDEX idx_transactions_backup_cont_center ON `transactions_backup_with_cost_center` (cont_center);');
    } catch (e) {
      // index may already exist or DB does not support IF NOT EXISTS for index
    }

    console.log('All fixes applied.');
  } catch (err) {
    console.error('Failed to apply fixes:', err);
    process.exitCode = 1;
  } finally {
    try {
      if (ds.isInitialized) await ds.destroy();
    } catch {}
  }
}

run();
