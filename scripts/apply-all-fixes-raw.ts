import * as mysql from 'mysql2/promise';

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '') || 3307;
  const user = process.env.DB_USER || process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || process.env.DB_DATABASE || 'F360DB';

  const conn = await mysql.createConnection({ host, port, user, password, database });
  try {
    console.log('Connected to DB', host, database);

    // 1) Ensure `range` column exists on google_sheet_config
    const [cols]: any = await conn.execute(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'range'`
    );
    const cnt = Number(cols[0]?.cnt ?? 0);
    if (cnt === 0) {
      console.log('Adding `range` column to `google_sheet_config`...');
      await conn.execute("ALTER TABLE `google_sheet_config` ADD COLUMN `range` VARCHAR(255) NULL;");
    } else {
      console.log('`range` column already present.');
    }

    // 2) Create transactions backup with cont_center
    console.log('Dropping existing backup table if any...');
    await conn.execute('DROP TABLE IF EXISTS `transactions_backup_with_cost_center`;');

    console.log('Creating backup table transactions_backup_with_cost_center...');
    await conn.execute(
      `CREATE TABLE transactions_backup_with_cost_center AS
       SELECT t.*, b.cost_center AS cont_center
       FROM \`transaction\` t
       LEFT JOIN \`budget\` b ON t.centreId = b.id`
    );

    console.log('Creating index idx_transactions_backup_cont_center (if possible)...');
    try {
      await conn.execute('CREATE INDEX idx_transactions_backup_cont_center ON `transactions_backup_with_cost_center` (cont_center);');
    } catch (e) {
      console.warn('Could not create index (maybe exists):', e.message ?? e);
    }

    console.log('All fixes applied successfully.');
  } catch (err: any) {
    console.error('Failed to apply fixes:', err.message || err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

run();
