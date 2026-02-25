import AppDataSource from '../db/typeorm.config';
import { DataSource } from 'typeorm';
import { BudgetTache } from '../src/budget/entities/budget-tache.entity';
import { BudgetSousActivity } from '../src/budget/entities/budget-sous-activity.entity';
import { BudgetActivity } from '../src/budget/entities/budget-activity.entity';
import { Department } from '../src/department/entities/department.entity';

function normalizeKey(s: string | null | undefined) {
  if (s === undefined || s === null) return null;
  return String(s).trim().toLowerCase();
}

async function run(ds: DataSource) {
  const tacheRepo = ds.getRepository(BudgetTache);
  const sousRepo = ds.getRepository(BudgetSousActivity);
  const activityRepo = ds.getRepository(BudgetActivity);
  const deptRepo = ds.getRepository(Department);

  const summary = {
    tachesRemoved: 0,
    sousRemoved: 0,
    activitiesRemoved: 0,
    departmentsRemoved: 0,
  };

  // ---------- Taches (merge by costCode) ----------
  console.log('Scanning taches for duplicates...');
  const taches = await tacheRepo.find({ relations: ['budgets'] });
  const byCost = new Map<string, BudgetTache[]>();
  for (const t of taches) {
    const k = normalizeKey(t.costCode);
    if (!k) continue; // skip null/empty costCode
    if (!byCost.has(k)) byCost.set(k, []);
    byCost.get(k)!.push(t);
  }

  for (const [k, group] of byCost.entries()) {
    if (group.length <= 1) continue;
    group.sort((a, b) => a.id - b.id);
    const keeper = group.find(g => g.budgets && g.budgets.length > 0) || group[0];
    const toMerge = group.filter(g => g.id !== keeper.id);
    for (const other of toMerge) {
      await ds.query('UPDATE budget SET tache_id = ? WHERE tache_id = ?', [keeper.id, other.id]);
      await tacheRepo.delete(other.id);
      summary.tachesRemoved++;
      console.log(`Merged tache ${other.id} -> ${keeper.id} (costCode=${k})`);
    }
  }

  // ---------- Sous Activities (merge by activityId + name) ----------
  console.log('Scanning sous activities for duplicates...');
  const sousList = await sousRepo.find({ relations: ['taches', 'budgets'] });
  const sousMap = new Map<string, BudgetSousActivity[]>();
  for (const s of sousList) {
    const key = (s.activity && (s.activity as any).id ? String((s.activity as any).id) : 'null') + '||' + (normalizeKey(s.name) || '');
    if (!sousMap.has(key)) sousMap.set(key, []);
    sousMap.get(key)!.push(s);
  }

  for (const [key, group] of sousMap.entries()) {
    if (group.length <= 1) continue;
    group.sort((a, b) => a.id - b.id);
    const keeper = group.find(g => (g.taches && g.taches.length > 0) || (g.budgets && g.budgets.length > 0)) || group[0];
    const toMerge = group.filter(g => g.id !== keeper.id);
    for (const other of toMerge) {
      await ds.query('UPDATE budget_tache SET sous_activity_id = ? WHERE sous_activity_id = ?', [keeper.id, other.id]);
      await ds.query('UPDATE budget SET sous_activity_id = ? WHERE sous_activity_id = ?', [keeper.id, other.id]);
      await sousRepo.delete(other.id);
      summary.sousRemoved++;
      console.log(`Merged sousActivity ${other.id} -> ${keeper.id} (${key})`);
    }
  }

  // ---------- Activities (merge by departmentId + name) ----------
  console.log('Scanning activities for duplicates...');
  const activities = await activityRepo.find({ relations: ['sousActivities', 'budgets'] });
  const actMap = new Map<string, BudgetActivity[]>();
  for (const a of activities) {
    const deptId = a.departmentId ? String(a.departmentId) : 'null';
    const key = deptId + '||' + (normalizeKey(a.name) || '');
    if (!actMap.has(key)) actMap.set(key, []);
    actMap.get(key)!.push(a);
  }

  for (const [key, group] of actMap.entries()) {
    if (group.length <= 1) continue;
    group.sort((a, b) => a.id - b.id);
    const keeper = group.find(g => (g.sousActivities && g.sousActivities.length > 0) || (g.budgets && g.budgets.length > 0)) || group[0];
    const toMerge = group.filter(g => g.id !== keeper.id);
    for (const other of toMerge) {
      await ds.query('UPDATE budget_sous_activity SET activity_id = ? WHERE activity_id = ?', [keeper.id, other.id]);
      await ds.query('UPDATE budget_tache SET activity_id = ? WHERE activity_id = ?', [keeper.id, other.id]);
      await ds.query('UPDATE budget SET activity_id = ? WHERE activity_id = ?', [keeper.id, other.id]);
      await activityRepo.delete(other.id);
      summary.activitiesRemoved++;
      console.log(`Merged activity ${other.id} -> ${keeper.id} (${key})`);
    }
  }

  // ---------- Departments (merge by name) ----------
  console.log('Scanning departments for duplicates...');
  const depts = await deptRepo.find({ relations: ['activities'] });
  const deptMap = new Map<string, Department[]>();
  for (const d of depts) {
    const key = normalizeKey(d.name) || '';
    if (!deptMap.has(key)) deptMap.set(key, []);
    deptMap.get(key)!.push(d);
  }

  for (const [key, group] of deptMap.entries()) {
    if (group.length <= 1) continue;
    group.sort((a, b) => a.id - b.id);
    const keeper = group.find(g => (g.activities && g.activities.length > 0)) || group[0];
    const toMerge = group.filter(g => g.id !== keeper.id);
    for (const other of toMerge) {
      await ds.query('UPDATE budget_activity SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
      await ds.query('UPDATE budget_tache SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
      await ds.query('UPDATE budget_sous_activity SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
      await ds.query('UPDATE budget SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
      await ds.query('UPDATE budget SET assigned_department_id = ? WHERE assigned_department_id = ?', [keeper.id, other.id]);
      await deptRepo.delete(other.id);
      summary.departmentsRemoved++;
      console.log(`Merged department ${other.id} -> ${keeper.id} (${key})`);
    }
  }

  console.log('\nDeduplication summary:', summary);
}

async function main() {
  console.log('Initializing datasource...');
  const ds = AppDataSource as DataSource;
  try {
    if (!ds.isInitialized) await ds.initialize();
    await run(ds);
  } catch (err) {
    console.error('Error during dedupe:', err);
  } finally {
    if (ds.isInitialized) await ds.destroy();
    process.exit(0);
  }
}

main();
