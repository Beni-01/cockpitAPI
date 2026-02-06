import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

type Nullable<T> = T | null;

const DEFAULT_BUDGET_BACK_CSV = path.join(__dirname, '..', 'data', 'budget_back.csv');
const DEFAULT_TRANSACTIONS_CSV = path.join(__dirname, '..', 'data', 'transactions.csv');

function getArgValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
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

async function run() {
  const budgetBackCsvPath = getArgValue('budgetBack') || DEFAULT_BUDGET_BACK_CSV;
  const transactionsCsvPath = getArgValue('transactions') || DEFAULT_TRANSACTIONS_CSV;
  const showMissing = toNullableInt(getArgValue('showMissing')) ?? 50;
  const checkTransactions = hasFlag('checkTransactions');

  if (!fs.existsSync(budgetBackCsvPath)) {
    console.error('budget_back.csv not found:', budgetBackCsvPath);
    process.exit(2);
  }

  const budgetRows = readCsvRecords(budgetBackCsvPath);
  if (budgetRows.length === 0) {
    console.log('No rows in budget_back.csv');
    return;
  }

  let missingId = 0;
  let missingCostCenter = 0;
  const idToCostCenter = new Map<number, string>();
  const duplicateId = new Map<number, number>();
  const costCenterToIds = new Map<string, Set<number>>();

  for (const r of budgetRows) {
    const id = toNullableInt(r.id);
    const costCenter = toNullIfEmptyOrNullish(r.cost_center ?? r.costCenter);
    if (id === null) {
      missingId++;
      continue;
    }
    if (!costCenter) {
      missingCostCenter++;
      continue;
    }

    if (idToCostCenter.has(id)) {
      duplicateId.set(id, (duplicateId.get(id) || 1) + 1);
    } else {
      idToCostCenter.set(id, costCenter);
    }

    if (!costCenterToIds.has(costCenter)) costCenterToIds.set(costCenter, new Set<number>());
    costCenterToIds.get(costCenter)!.add(id);
  }

  const duplicateCostCenters = Array.from(costCenterToIds.entries())
    .filter(([, ids]) => ids.size > 1)
    .map(([cc, ids]) => ({ cost_center: cc, ids: Array.from(ids).sort((a, b) => a - b) }));

  console.log('Budget back CSV:', budgetBackCsvPath);
  console.log('Rows:', budgetRows.length);
  console.log('Missing/invalid id:', missingId);
  console.log('Missing cost_center:', missingCostCenter);
  console.log('Unique ids:', idToCostCenter.size);
  console.log('Duplicate id count:', duplicateId.size);
  console.log('Duplicate cost_center count (same cost_center used by multiple ids):', duplicateCostCenters.length);

  if (duplicateCostCenters.length > 0) {
    console.log('\nExamples duplicate cost_center:');
    for (const ex of duplicateCostCenters.slice(0, 10)) {
      console.log(` - ${ex.cost_center} => ids: ${ex.ids.join(', ')}`);
    }
  }

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.log('\nDB check skipped (missing DB_HOST/DB_USER/DB_NAME).');
    return;
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
    const [rows] = await conn.query('SELECT id, cost_center FROM `budget` WHERE cost_center IS NOT NULL');
    const dbCostCenters = new Set<string>();
    const duplicatesInDb = new Map<string, number>();
    for (const rr of rows as any[]) {
      const cc = toNullIfEmptyOrNullish((rr as any).cost_center);
      if (!cc) continue;
      if (dbCostCenters.has(cc)) duplicatesInDb.set(cc, (duplicatesInDb.get(cc) || 1) + 1);
      dbCostCenters.add(cc);
    }

    const missingInDb: { id: number; cost_center: string }[] = [];
    for (const [id, costCenter] of idToCostCenter.entries()) {
      if (!dbCostCenters.has(costCenter)) missingInDb.push({ id, cost_center: costCenter });
    }

    console.log('\nDB budget coverage:');
    console.log('Distinct budget.cost_center:', dbCostCenters.size);
    console.log('Duplicate budget.cost_center count:', duplicatesInDb.size);
    console.log('budget_back cost_center missing in DB:', missingInDb.length);
    if (missingInDb.length > 0) {
      console.log(`First ${Math.min(showMissing, missingInDb.length)} missing:`);
      for (const m of missingInDb.slice(0, showMissing)) {
        console.log(` - budget_back.id=${m.id} cost_center=${m.cost_center}`);
      }
    }

    if (checkTransactions) {
      if (!fs.existsSync(transactionsCsvPath)) {
        console.log('\nTransactions check skipped (transactions.csv not found):', transactionsCsvPath);
        return;
      }
      const tx = readCsvRecords(transactionsCsvPath);
      const txCentreIds = new Set<number>();
      let txNull = 0;
      for (const tr of tx) {
        const centreId = toNullableInt(tr.centreId);
        if (centreId === null) txNull++;
        else txCentreIds.add(centreId);
      }
      let txMapped = 0;
      let txMissing = 0;
      for (const cid of txCentreIds) {
        if (idToCostCenter.has(cid)) txMapped++;
        else txMissing++;
      }
      console.log('\nTransactions mapping coverage (old centreId -> budget_back.id):');
      console.log('transactions rows:', tx.length);
      console.log('transactions centreId NULL:', txNull);
      console.log('distinct non-null centreId:', txCentreIds.size);
      console.log('distinct centreId found in budget_back:', txMapped);
      console.log('distinct centreId missing in budget_back:', txMissing);
    }
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
