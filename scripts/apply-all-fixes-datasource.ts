import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

// Load environment variables
config();

/**
 * Master Budget Import Script
 * 
 * Step 1: Import Master Budget - Cost Center (creates/updates hierarchy)
 * Step 2: Import Budget Summary CSVs (creates/updates budget records)
 * 
 * This ensures all hierarchy entities exist before importing budget data
 */

// Initialize data source
const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'F360DB',
    // allow executing multi-statement SQL dumps
    extra: {
      multipleStatements: true,
    },
});
async function run() {
  try {
    console.log('Initializing DataSource...');
    await AppDataSource.initialize();

    const qr = AppDataSource.createQueryRunner();

    // Truncate `google_sheet_config` first if it exists (best-effort).
    // If foreign keys reference the table, temporarily disable checks while truncating.
    try {
      const hasGsc = await qr.hasTable('google_sheet_config');
      if (hasGsc) {
        console.log('Truncating table `google_sheet_config` before applying dump...');
        try {
          try {
            await qr.query('SET FOREIGN_KEY_CHECKS = 0;');
          } catch (e) {
            console.warn('Could not disable FOREIGN_KEY_CHECKS (continuing):', e && e.message ? e.message : e);
          }
          try {
            await qr.query('TRUNCATE TABLE `google_sheet_config`;');
            console.log('Truncated `google_sheet_config`.');
          } catch (e) {
            console.warn('Failed to truncate google_sheet_config (continuing):', e && e.message ? e.message : e);
          }
          try {
            await qr.query('SET FOREIGN_KEY_CHECKS = 1;');
          } catch (e) {
            console.warn('Could not re-enable FOREIGN_KEY_CHECKS (manual re-enable may be required):', e && e.message ? e.message : e);
          }
        } catch (e) {
          console.warn('Unexpected error during truncate (continuing):', (e && e.message) || e);
        }
      } else {
        console.log('Table `google_sheet_config` does not exist; will create from dump if provided.');
      }
    } catch (e) {
      console.warn('Could not determine existence of google_sheet_config table:', (e && e.message) || e);
    }

    // Apply google_sheet_config SQL dump if present (best-effort, statement-by-statement)
    try {
      const dumpPath = path.resolve(__dirname, '..', 'DB_Scripts', 'google_sheet_config_dump.sql');
      if (fs.existsSync(dumpPath)) {
        console.log('Found SQL dump at', dumpPath, ' — applying...');
        const dumpSql = fs.readFileSync(dumpPath, 'utf8');
        // remove lines starting with -- and strip non-versioned /* */ comments
        const lines = dumpSql.split(/\r?\n/);
        const filtered: string[] = [];
        let inBlock = false;
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!inBlock) {
            if (line.startsWith('--')) continue;
            if (line.startsWith('/*')) {
              // preserve MySQL versioned comments like /*!40101 ... */
              if (line.startsWith('/*!')) {
                filtered.push(rawLine);
                // if the block doesn't end on same line, keep collecting until '*/'
                if (!rawLine.includes('*/')) inBlock = true;
              } else {
                if (!rawLine.includes('*/')) inBlock = true;
                // skip non-versioned comment start
              }
            } else {
              filtered.push(rawLine);
            }
          } else {
            // inside non-versioned comment block
            if (rawLine.includes('*/')) inBlock = false;
            // skip
          }
        }
        const cleaned = filtered.join('\n');
        // split statements on semicolon followed by newline or end-of-string
        const stmts = cleaned.split(/;\s*(?:\r?\n|$)/).map(s => s.trim()).filter(s => s.length);
        for (const stmt of stmts) {
          const s = stmt.trim();
          // handle INSERT INTO google_sheet_config specially: parse tuples and insert one-by-one
          if (/^INSERT\s+INTO\s+`?google_sheet_config`?/i.test(s)) {
            console.log('Processing INSERT INTO google_sheet_config: splitting and applying tuples one-by-one...');
            try {
              const m = s.match(/^INSERT\s+INTO\s+`?google_sheet_config`?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)$/i);
              if (!m) {
                console.warn('Could not parse INSERT statement header; skipping.');
                continue;
              }
              const cols = m[1].split(',').map(c => c.trim().replace(/`/g, ''));
              // ensure any columns referenced by the INSERT exist; add minimal-safe column types when missing
              try {
                const colInfoRows: Array<any> = await qr.query("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config'");
                const existingCols = (colInfoRows || []).map((r: any) => r.COLUMN_NAME);
                const missing = cols.filter(c => !existingCols.includes(c));
                for (const mc of missing) {
                  console.log('Adding missing column to google_sheet_config:', mc);
                  try {
                    if (mc === 'column_mapping') {
                      await qr.query("ALTER TABLE `google_sheet_config` ADD COLUMN `column_mapping` JSON DEFAULT NULL;");
                    } else if (/(_at|_time|updated_at|created_at)$/i.test(mc)) {
                      await qr.query(`ALTER TABLE \`google_sheet_config\` ADD COLUMN \`${mc}\` TIMESTAMP NULL DEFAULT NULL;`);
                    } else if (/^(is_|use_|auto_|snapshot_retention_days|polling_interval_minutes)$/i.test(mc)) {
                      await qr.query(`ALTER TABLE \`google_sheet_config\` ADD COLUMN \`${mc}\` TINYINT(1) DEFAULT NULL;`);
                    } else if (/_id$|^id$|created_by|updated_by/i.test(mc)) {
                      await qr.query(`ALTER TABLE \`google_sheet_config\` ADD COLUMN \`${mc}\` INT DEFAULT NULL;`);
                    } else {
                      await qr.query(`ALTER TABLE \`google_sheet_config\` ADD COLUMN \`${mc}\` TEXT DEFAULT NULL;`);
                    }
                    console.log('Added column', mc);
                  } catch (e) {
                    console.warn('Failed to add missing column', mc, (e && e.message) || e);
                  }
                }
              } catch (e) {
                console.warn('Could not verify/add missing google_sheet_config columns:', (e && e.message) || e);
              }
              let valuesPart = m[2].trim();
              if (valuesPart.endsWith(';')) valuesPart = valuesPart.slice(0, -1).trim();
              const tuples = valuesPart.split(/\)\s*,\s*\(/g).map(t => t.replace(/^\(?|\)?$/g, '').trim()).filter(t => t.length);

              const parseTuple = (tupleStr: string) => {
                const vals: string[] = [];
                let cur = '';
                let inQuote = false;
                let escape = false;
                for (let i = 0; i < tupleStr.length; i++) {
                  const ch = tupleStr[i];
                  if (inQuote) {
                    if (escape) {
                      cur += ch;
                      escape = false;
                    } else if (ch === '\\') {
                      escape = true;
                    } else if (ch === "'") {
                      inQuote = false;
                      // include closing quote
                      // cur += ch;
                    } else {
                      cur += ch;
                    }
                  } else {
                    if (ch === "'") {
                      inQuote = true;
                    } else if (ch === ',') {
                      vals.push(cur.trim());
                      cur = '';
                    } else {
                      cur += ch;
                    }
                  }
                }
                if (cur.length) vals.push(cur.trim());
                return vals.map(v => {
                  if (/^NULL$/i.test(v)) return null;
                  if (v.startsWith("'") && v.endsWith("'")) {
                    let inner = v.slice(1, -1);
                    inner = inner.replace(/\\'/g, "'").replace(/''/g, "'");
                    return inner;
                  }
                  return v;
                });
              };

              try { await qr.query('SET FOREIGN_KEY_CHECKS = 0;'); } catch (e) { /* ignore */ }
              let inserted = 0;
              for (const t of tuples) {
                const parsed = parseTuple(t.replace(/^\(|\)$/g, ''));
                const params = cols.map((col, idx) => parsed[idx] === undefined ? null : parsed[idx]);
                const placeholders = cols.map(() => '?').join(', ');
                const insertSql = `INSERT INTO \`google_sheet_config\` (${cols.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
                try {
                  await qr.query(insertSql, params);
                  inserted++;
                } catch (e) {
                  const msg = (e && e.message) || e;
                  // If JSON column is invalid, retry with column_mapping = NULL when present
                  if (/Invalid JSON text|Invalid.*JSON|column_mapping/i.test(msg)) {
                    const cmIndex = cols.findIndex(cn => cn === 'column_mapping');
                    if (cmIndex !== -1) {
                      const retryParams = params.slice();
                      retryParams[cmIndex] = null;
                      try {
                        await qr.query(insertSql, retryParams);
                        inserted++;
                        continue;
                      } catch (e2) {
                        console.warn('Insert failed after nulling column_mapping (skipping):', e2 && e2.message ? e2.message : e2);
                        continue;
                      }
                    }
                  }
                  if (/Incorrect datetime value|Incorrect.*value/.test(msg)) {
                    const sanitized = params.map(p => {
                      if (typeof p === 'string' && /\d{4}-\d{2}-\d{2} \d{2}:\d{3,}/.test(p)) return null;
                      if (typeof p === 'string' && /\d{4}-\d{2}-\d{2} \d{2}:\d{2,3}/.test(p) && /:\d{3,}/.test(p)) return null;
                      return p;
                    });
                    try {
                      await qr.query(insertSql, sanitized);
                      inserted++;
                      continue;
                    } catch (e2) {
                      console.warn('Insert failed even after sanitization (skipping):', e2 && e2.message ? e2.message : e2);
                      continue;
                    }
                  }
                  console.warn('Insert tuple failed (skipping):', msg);
                }
              }
              try { await qr.query('SET FOREIGN_KEY_CHECKS = 1;'); } catch (e) { /* ignore */ }
              console.log(`Inserted ${inserted} rows into google_sheet_config (best-effort).`);
            } catch (e) {
              console.warn('Failed to process INSERT INTO google_sheet_config (continuing):', (e && e.message) || e);
            }
            continue;
          }
          // only run DDL / non-INSERT statements; run best-effort
          try {
            await qr.query(stmt);
          } catch (e) {
            console.warn('SQL statement failed (continuing):', (e && e.message) || e, '\nStatement:', stmt.slice(0, 200));
          }
        }
        console.log('SQL dump apply finished.');
      } else {
        console.log('No SQL dump found at', dumpPath);
      }
    } catch (e) {
      console.warn('Failed to apply SQL dump:', (e && e.message) || e);
    }

    console.log('Ensuring google_sheet_config.range column exists...');
    const hasRange = await qr.hasColumn('google_sheet_config', 'range');
    if (!hasRange) {
      await qr.query("ALTER TABLE `google_sheet_config` ADD COLUMN `range` VARCHAR(255) NULL;");
      console.log('Added range column.');
    } else {
      console.log('range column already exists.');
    }

    console.log('Ensuring google_sheet_config.use_polling column exists...');
    const hasUsePolling = await qr.hasColumn('google_sheet_config', 'use_polling');
    if (!hasUsePolling) {
      try {
        await qr.query("ALTER TABLE `google_sheet_config` ADD COLUMN `use_polling` TINYINT(1) NOT NULL DEFAULT 0;");
        console.log('Added use_polling column.');
      } catch (e) {
        console.warn('Could not add use_polling column:', e.message || e);
      }
    } else {
      console.log('use_polling column already exists.');
    }

    console.log('Dropping existing transactions backup if any...');
    await qr.query('DROP TABLE IF EXISTS `transactions_backup_with_cost_center`;');

    // console.log('Ensuring `cont_center` column exists on `transaction`...');
    // const hasCont = await qr.hasColumn('transaction', 'cont_center');
    // if (!hasCont) {
    //   await qr.query("ALTER TABLE `transaction` ADD COLUMN `cont_center` VARCHAR(255) NULL;");
    //   console.log('Added cont_center column to transaction.');
    // } else {
    //   console.log('transaction.cont_center already exists.');
    // }

    // console.log('Updating `transaction.cont_center` from `budget.cost_center` where present...');
    // await qr.query(`UPDATE \`transaction\` t
    //   LEFT JOIN \`budget\` b ON t.centreId = b.id
    //   SET t.cont_center = b.cost_center`);

    // console.log('Creating transactions_backup_with_cost_center (avoiding duplicate cont_center)...');

    // Build column list for `transaction` excluding cont_center to avoid duplicate column names
    const colsRows: Array<any> = await qr.query("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transaction' ORDER BY ORDINAL_POSITION");
    const colNames: string[] = (colsRows || []).map((r: any) => r.COLUMN_NAME).filter((c: string) => c !== 'cont_center');
    // if (colNames.length === 0) {
    //   throw new Error('Could not determine columns for table `transaction`');
    // }
    const colsList = colNames.map(c => `t.\`${c}\``).join(', ');
    const createSql = `CREATE TABLE transactions_backup_with_cost_center AS
      SELECT ${colsList}, COALESCE(b.cost_center, bt.cost_code) AS cont_center
      FROM transaction t
      LEFT JOIN budget b ON t.centreId = b.id
      LEFT JOIN budget_tache bt ON b.tache_id = bt.id`;

    await qr.query(createSql);

    console.log('If backup has cont_center, set backup.centreId from budget matching cost_center...');
    await qr.query(`UPDATE transactions_backup_with_cost_center bup
      JOIN budget b ON bup.cont_center = b.cost_center
      SET bup.centreId = b.id
      WHERE bup.cont_center IS NOT NULL AND bup.centreId IS NULL`);

    console.log('Update original transaction.centreId from backup mapping where cont_center matched...');
    await qr.query(`UPDATE transaction t
      JOIN transactions_backup_with_cost_center bup ON t.id = bup.id
      SET t.centreId = bup.centreId
      WHERE bup.cont_center IS NOT NULL AND t.centreId IS NULL`);

    try {
      await qr.query('CREATE INDEX idx_transactions_backup_cont_center ON `transactions_backup_with_cost_center` (cont_center);');
    } catch (e) {
      // ignore index creation failures
    }

    console.log('All fixes applied via DataSource.');
  } catch (err) {
    console.error('Failed to apply fixes via DataSource:', err);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

run();
