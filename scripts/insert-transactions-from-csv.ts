const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

type Nullable<T> = T | null;

const DEFAULT_TRANSACTIONS_CSV = path.join(__dirname, '..', 'data', 'transactions.csv');
const DEFAULT_BUDGET_BACK_CSV = path.join(__dirname, '..', 'data', 'budget_back.csv');

function getArgValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a: string) => a.startsWith(prefix));
  if (!hit) return undefined;
  return hit.slice(prefix.length);
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function toNullIfEmptyOrNullish(value: any): Nullable<string> {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  if (s === '' || s.toLowerCase() === 'null') return null;
  return s;
}

function toNullableInt(value: any): Nullable<number> {
  const s = toNullIfEmptyOrNullish(value);
  if (s === null) return null;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n)) return null;
  return n;
}

function readCsvRecords(filePath: string): any[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
  return Array.isArray(records) ? records : [];
}

function buildOldIdToCostCenterMap(budgetBackCsvPath: string): Map<number, string> {
  const records = readCsvRecords(budgetBackCsvPath);
  const map = new Map<number, string>();
  for (const r of records) {
    const id = toNullableInt(r.id);
    const costCenter = toNullIfEmptyOrNullish(r.cost_center ?? r.costCenter);
    if (id === null) continue;
    if (!costCenter) continue;
    if (!map.has(id)) map.set(id, costCenter);
  }
  return map;
}

async function buildCostCenterToBudgetIdMap(conn: any): Promise<Map<string, number>> {
  const [rows] = await conn.query('SELECT id, cost_center FROM `budget` WHERE `cost_center` IS NOT NULL');
  const map = new Map<string, number>();
  const duplicates: string[] = [];

  for (const r of rows || []) {
    const costCenter = toNullIfEmptyOrNullish(r.cost_center);
    if (!costCenter) continue;
    const id = Number(r.id);
    if (!map.has(costCenter)) {
      map.set(costCenter, id);
    } else {
      // Keep the smallest id for determinism
      const existing = map.get(costCenter)!;
      if (id < existing) map.set(costCenter, id);
      if (duplicates.length < 20) duplicates.push(costCenter);
    }
  }

  if (duplicates.length > 0) {
    console.warn('Warning: duplicate cost_center values in DB budget table. Using smallest id for mapping. Examples:', duplicates.slice(0, 10));
  }
  return map;
}

function buildCentreIdUpdateSql(ids: number[]): string {
  // UPDATE `transaction` SET centreId = CASE id WHEN ? THEN ? ... END WHERE id IN (?,...?);
  const whens = ids.map(() => 'WHEN ? THEN ?').join(' ');
  const inList = ids.map(() => '?').join(',');
  return `UPDATE \`transaction\`\nSET \`centreId\` = CASE \`id\` ${whens} ELSE \`centreId\` END\nWHERE \`id\` IN (${inList})`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildInsertSql(rowCount: number): string {
  const cols = [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'id',
    'depense',
    'devise',
    'depense_init',
    'devise_convert',
    'description',
    'ref',
    'agent',
    'centreId',
  ];

  const valueGroup = `(${cols.map(() => '?').join(',')})`;
  const values = new Array(rowCount).fill(valueGroup).join(',\n');
  const updates = [
    'createdAt = VALUES(createdAt)',
    'updatedAt = VALUES(updatedAt)',
    'deletedAt = VALUES(deletedAt)',
    'depense = VALUES(depense)',
    'devise = VALUES(devise)',
    'depense_init = VALUES(depense_init)',
    'devise_convert = VALUES(devise_convert)',
    'description = VALUES(description)',
    'ref = VALUES(ref)',
    'agent = VALUES(agent)',
    'centreId = VALUES(centreId)',
  ].join(',\n');

  return `INSERT INTO \`transaction\` (${cols.map((c) => `\`${c}\``).join(', ')})\nVALUES\n${values}\nON DUPLICATE KEY UPDATE\n${updates}`;
}

export async function runInsertTransactionsFromCsv() {
  const execute = hasFlag('execute');
  const updateCentreIdOnly = hasFlag('updateCentreIdOnly');
  const setNullOnUnmapped = hasFlag('setNullOnUnmapped');
  const transactionsCsvPath = getArgValue('transactions') || DEFAULT_TRANSACTIONS_CSV;
  const budgetBackCsvPath = getArgValue('budgetBack') || DEFAULT_BUDGET_BACK_CSV;
  const limit = toNullableInt(getArgValue('limit'));
  const batchSize = toNullableInt(getArgValue('batch')) || 500;

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Missing DB env vars. Set DB_HOST, DB_USER, DB_NAME (and optionally DB_PORT, DB_PASSWORD).');
    process.exit(1);
  }

  if (!fs.existsSync(transactionsCsvPath)) {
    console.error('Transactions CSV not found:', transactionsCsvPath);
    process.exit(2);
  }
  const hasBudgetBack = fs.existsSync(budgetBackCsvPath);
  if (!hasBudgetBack) {
    console.error('Mapping CSV not found: budget_back CSV:', budgetBackCsvPath);
    process.exit(2);
  }

  const port = DB_PORT ? Number(DB_PORT) : 3306;
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port,
    user: DB_USER,
    password: DB_PASSWORD || '',
    database: DB_NAME,
    multipleStatements: false,
  });

  try {
    // Mapping: old centreId (Budget.id) -> budget_back.cost_center
    const oldIdToCostCenter = buildOldIdToCostCenterMap(budgetBackCsvPath);
    const costCenterToBudgetId = await buildCostCenterToBudgetIdMap(conn);

    const txRecords = readCsvRecords(transactionsCsvPath);
    const records = limit ? txRecords.slice(0, limit) : txRecords;
    if (records.length === 0) {
      console.log('No transactions found in CSV.');
      return;
    }

    let nullCentre = 0;
    let mapped = 0;
    let missingOldCentre = 0;
    let missingCostCenterInDb = 0;
    let missingId = 0;
    let willUpdate = 0;

    const rowsToInsert: any[] = [];
    const centreUpdates: Array<{ id: number; centreId: Nullable<number> }> = [];

    for (const r of records) {
      const id = toNullableInt(r.id);
      if (id === null) {
        missingId++;
        continue;
      }

      const oldCentreId = toNullableInt(r.centreId);
      let newCentreId: Nullable<number> = null;

      if (oldCentreId === null) {
        nullCentre++;
      } else {
        const costCenter = oldIdToCostCenter.get(oldCentreId);
        console.log(`Transaction id=${id} has old centreId=${oldCentreId} mapped to cost_center=${costCenter}`);
        if (!costCenter) {
          missingOldCentre++;
        } else {
          const budgetId = costCenterToBudgetId.get(costCenter);
          if (!budgetId) {
            missingCostCenterInDb++;
          } else {
            newCentreId = budgetId;
            mapped++;
          }
        }
      }
      console.log(`Processing transaction id=${id}, old centreId=${oldCentreId}, mapped new centreId=${newCentreId}`,);

      if (updateCentreIdOnly) {
        // Safe default: only update rows where we have a mapped centreId.
        // If --setNullOnUnmapped is provided, we will also write NULL for unmapped.
        if (newCentreId !== null || setNullOnUnmapped) {
          centreUpdates.push({ id, centreId: newCentreId });
          willUpdate++;
        }
      }

      rowsToInsert.push({
        createdAt: toNullIfEmptyOrNullish(r.createdAt),
        updatedAt: toNullIfEmptyOrNullish(r.updatedAt),
        deletedAt: toNullIfEmptyOrNullish(r.deletedAt),
        id,
        depense: toNullIfEmptyOrNullish(r.depense),
        devise: toNullIfEmptyOrNullish(r.devise) || 'USD',
        depense_init: toNullIfEmptyOrNullish(r.depense_init),
        devise_convert: toNullIfEmptyOrNullish(r.devise_convert) || 'USD',
        description: toNullIfEmptyOrNullish(r.description),
        ref: toNullIfEmptyOrNullish(r.ref),
        agent: toNullIfEmptyOrNullish(r.agent),
        centreId: newCentreId,
      });
    }
console.log('=== Transaction Import Summary ===',JSON.stringify({
  }, null, 2));
    console.log('Transactions CSV:', transactionsCsvPath);
   
      console.log('Budget back CSV (id -> cost_center):', budgetBackCsvPath);
   
    console.log('Rows read:', records.length);
    console.log('Rows with missing id skipped:', missingId);
    console.log('CentreId was NULL:', nullCentre);
    console.log('CentreId mapped to budget.id:', mapped);
    console.log('CentreId not found in mapping CSV:', missingOldCentre);
    console.log('cost_center not found in DB budget:', missingCostCenterInDb);
    if (updateCentreIdOnly) {
      console.log('Mode: updateCentreIdOnly (no other fields touched)');
      console.log('Rows that will be updated:', willUpdate);
    }

    if (!execute) {
      console.log('Dry-run only. Re-run with --execute to insert/update into DB.');
      return;
    }

    if (updateCentreIdOnly) {
      const updateBatches = chunk(centreUpdates, Math.max(1, batchSize));
      let processed = 0;
      await conn.beginTransaction();
      try {
        for (const batch of updateBatches) {
          const ids = batch.map((b) => b.id);
          const sql = buildCentreIdUpdateSql(ids);
          const params: any[] = [];
          // CASE params
          for (const b of batch) {
            params.push(b.id, b.centreId);
          }
          // IN params
          for (const id of ids) params.push(id);
          await conn.query(sql, params);
          processed += batch.length;
        }
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      }
      console.log('Updated transactions centreId:', processed);
    } else {
      const batches = chunk(rowsToInsert, Math.max(1, batchSize));
      let processed = 0;

      await conn.beginTransaction();
      try {
        for (const batch of batches) {
          const sql = buildInsertSql(batch.length);
          const params: any[] = [];
          for (const row of batch) {
            params.push(
              row.createdAt,
              row.updatedAt,
              row.deletedAt,
              row.id,
              row.depense,
              row.devise,
              row.depense_init,
              row.devise_convert,
              row.description,
              row.ref,
              row.agent,
              row.centreId,
            );
          }

          await conn.query(sql, params);
          processed += batch.length;
        }
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      }

      console.log('Inserted/updated transactions:', processed);
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  runInsertTransactionsFromCsv().catch((e: any) => {
    console.error(e);
    process.exit(4);
  });
}
