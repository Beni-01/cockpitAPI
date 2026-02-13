#!/usr/bin/env ts-node
/**
 * Script: remove-duplicate-activities.ts
 *
 * Finds duplicate rows in `budget_activity` grouped by department + normalized name,
 * reassigns dependent rows (budget_sous_activity.activity_id, budget_tache.activity_id, budget.activity_id)
 * to a canonical activity, and deletes the duplicates.
 *
 * Usage:
 *  npx ts-node scripts/remove-duplicate-activities.ts [--dry-run]
 */

import { createPool } from 'mysql2/promise';
import { AppDataSource } from '../src/data-source';

function normalizeName(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  try {
    const noDia = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return noDia.replace(/\s+/g, ' ').trim().toLowerCase();
  } catch (e) {
    const noDia = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return noDia.replace(/\s+/g, ' ').trim().toLowerCase();
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const opts: any = (AppDataSource && (AppDataSource.options || {})) || {};
  const pool = createPool({
    host: opts.host || process.env.DB_HOST || 'localhost',
    port: Number(opts.port || process.env.DB_PORT) || 3307,
    user: opts.username || process.env.DB_USER || 'root',
    password: opts.password || process.env.DB_PASSWORD || '',
    database: opts.database || process.env.DB_NAME || 'F360DB',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
  });

  const conn = await pool.getConnection();
  try {
    console.log('Loading activities from database...');
    const [rows] = await conn.query(`SELECT id, name, department_id, code FROM budget_activity WHERE name IS NOT NULL`);
    const activities: Array<any> = rows as any[];

    const groups = new Map<string, Array<{ id: number; name: string; department_id: number | null; code: string | null }>>();
    for (const a of activities) {
      const norm = normalizeName(a.name) || '';
      const key = `${a.department_id || 0}::${norm}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }

    const summary: Array<{ departmentId: number | null; canonical: number; removed: number[] }> = [];

    for (const [key, items] of groups.entries()) {
      if (items.length <= 1) continue;

      items.sort((x, y) => {
        const xHasCode = x.code ? 0 : 1;
        const yHasCode = y.code ? 0 : 1;
        if (xHasCode !== yHasCode) return xHasCode - yHasCode;
        return x.id - y.id;
      });

      const canonical = items[0];
      const toRemove = items.slice(1).map((i) => i.id);
      if (toRemove.length === 0) continue;

      summary.push({ departmentId: canonical.department_id, canonical: canonical.id, removed: toRemove });
      console.log(`Group ${key}: keep=${canonical.id} remove=${toRemove.join(', ')}`);

      if (dryRun) continue;

      try {
        await conn.beginTransaction();
        const placeholders = toRemove.map(() => '?').join(',');
        const params = [canonical.id, ...toRemove];
        await conn.query(`UPDATE budget_sous_activity SET activity_id = ? WHERE activity_id IN (${placeholders})`, params);
        await conn.query(`UPDATE budget_tache SET activity_id = ? WHERE activity_id IN (${placeholders})`, params);
        await conn.query(`UPDATE budget SET activity_id = ? WHERE activity_id IN (${placeholders})`, params);
        await conn.query(`DELETE FROM budget_activity WHERE id IN (${placeholders})`, toRemove);
        await conn.commit();
        console.log(`Committed: reassigned dependents to ${canonical.id} and removed ${toRemove.length} rows`);
      } catch (err) {
        await conn.rollback();
        console.error('Transaction failed for group', key, err?.message || err);
      }
    }

    console.log('Dedupe summary:');
    console.table(summary);
    if (dryRun) console.log('Dry run mode - no changes were applied.');
    // --- Now dedupe sous-activities ---
    console.log('\nScanning budget_sous_activity for duplicates...');
    const [sousRows] = await conn.query(`SELECT id, name, department_id, activity_id, code FROM budget_sous_activity WHERE name IS NOT NULL`);
    const sous: Array<any> = sousRows as any[];
    const sousGroups = new Map<string, Array<any>>();
    for (const s of sous) {
      const norm = normalizeName(s.name) || '';
      const key = `${s.department_id || 0}::${s.activity_id || 0}::${norm}`;
      if (!sousGroups.has(key)) sousGroups.set(key, []);
      sousGroups.get(key)!.push(s);
    }

    const sousSummary: Array<{ departmentId: number | null; activityId: number | null; canonical: number; removed: number[] }> = [];
    for (const [key, items] of sousGroups.entries()) {
      if (items.length <= 1) continue;
      items.sort((x, y) => {
        const xHasCode = x.code ? 0 : 1;
        const yHasCode = y.code ? 0 : 1;
        if (xHasCode !== yHasCode) return xHasCode - yHasCode;
        return x.id - y.id;
      });
      const canonical = items[0];
      const toRemove = items.slice(1).map((i) => i.id);
      if (toRemove.length === 0) continue;

      sousSummary.push({ departmentId: canonical.department_id, activityId: canonical.activity_id, canonical: canonical.id, removed: toRemove });
      console.log(`SousGroup ${key}: keep=${canonical.id} remove=${toRemove.join(', ')}`);

      if (dryRun) continue;

      try {
        await conn.beginTransaction();
        const placeholders = toRemove.map(() => '?').join(',');
        const params = [canonical.id, ...toRemove];
        await conn.query(`UPDATE budget_tache SET sous_activity_id = ? WHERE sous_activity_id IN (${placeholders})`, params);
        await conn.query(`UPDATE budget SET sous_activity_id = ? WHERE sous_activity_id IN (${placeholders})`, params);
        await conn.query(`DELETE FROM budget_sous_activity WHERE id IN (${placeholders})`, toRemove);
        await conn.commit();
        console.log(`Committed sous activity dedupe: reassigned dependents to ${canonical.id} and removed ${toRemove.length} rows`);
      } catch (err) {
        await conn.rollback();
        console.error('Sous activity transaction failed for group', key, err?.message || err);
      }
    }

    console.log('\nSous-activity dedupe summary:');
    console.table(sousSummary);

    // --- Now dedupe taches ---
    console.log('\nScanning budget_tache for duplicates...');
    const [tacheRows] = await conn.query(`SELECT id, name, department_id, activity_id, sous_activity_id, code, costCode FROM budget_tache WHERE name IS NOT NULL`);
    const taches: Array<any> = tacheRows as any[];
    const tacheGroups = new Map<string, Array<any>>();
    for (const t of taches) {
      const norm = normalizeName(t.name) || '';
      const key = `${t.department_id || 0}::${t.activity_id || 0}::${t.sous_activity_id || 0}::${norm}`;
      if (!tacheGroups.has(key)) tacheGroups.set(key, []);
      tacheGroups.get(key)!.push(t);
    }

    const tacheSummary: Array<{ departmentId: number | null; activityId: number | null; sousId: number | null; canonical: number; removed: number[] }> = [];
    for (const [key, items] of tacheGroups.entries()) {
      if (items.length <= 1) continue;
      items.sort((x, y) => {
        const xHasCode = x.costCode || x.code ? 0 : 1;
        const yHasCode = y.costCode || y.code ? 0 : 1;
        if (xHasCode !== yHasCode) return xHasCode - yHasCode;
        return x.id - y.id;
      });
      const canonical = items[0];
      const toRemove = items.slice(1).map((i) => i.id);
      if (toRemove.length === 0) continue;

      tacheSummary.push({ departmentId: canonical.department_id, activityId: canonical.activity_id, sousId: canonical.sous_activity_id, canonical: canonical.id, removed: toRemove });
      console.log(`TacheGroup ${key}: keep=${canonical.id} remove=${toRemove.join(', ')}`);

      if (dryRun) continue;

      try {
        await conn.beginTransaction();
        const placeholders = toRemove.map(() => '?').join(',');
        const params = [canonical.id, ...toRemove];
        await conn.query(`UPDATE budget SET tache_id = ? WHERE tache_id IN (${placeholders})`, params);
        await conn.query(`DELETE FROM budget_tache WHERE id IN (${placeholders})`, toRemove);
        await conn.commit();
        console.log(`Committed tache dedupe: reassigned budgets to ${canonical.id} and removed ${toRemove.length} rows`);
      } catch (err) {
        await conn.rollback();
        console.error('Tache transaction failed for group', key, err?.message || err);
      }
    }

    console.log('\nTache dedupe summary:');
    console.table(tacheSummary);
  } finally {
    conn.release();
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Script error', e?.message || e);
    process.exit(1);
  });
}

export default main;
