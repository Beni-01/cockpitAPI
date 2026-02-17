import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Department } from 'src/department/entities/department.entity';
import { BudgetActivity } from 'src/budget/entities/budget-activity.entity';
import { BudgetSousActivity } from 'src/budget/entities/budget-sous-activity.entity';
import { BudgetTache } from 'src/budget/entities/budget-tache.entity';
import { Budget } from 'src/budget/entities/budget.entity';

@Injectable()
export class HierarchySyncService {
  private departmentRepo: Repository<Department>;
  private activityRepo: Repository<BudgetActivity>;
  private sousActivityRepo: Repository<BudgetSousActivity>;
  private tacheRepo: Repository<BudgetTache>;
  private budgetRepo: Repository<Budget>;

  constructor(private readonly dataSource: DataSource) {
    this.departmentRepo = dataSource.getRepository(Department);
    this.activityRepo = dataSource.getRepository(BudgetActivity);
    this.sousActivityRepo = dataSource.getRepository(BudgetSousActivity);
    this.tacheRepo = dataSource.getRepository(BudgetTache);
    this.budgetRepo = dataSource.getRepository(Budget);
  }

  /* ----------------------------------------------------
     HELPERS
  ---------------------------------------------------- */
  private clean(v: any): string | null {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  }

  private codeify(v: string): string {
    return v.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  }

  /* ----------------------------------------------------
     MAIN ENTRY
  ---------------------------------------------------- */
  async syncHierarchy(rows: any[]) {
    const validCostCodes = new Set<string>();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const departmentName = row['DEPARTEMENT / DIRECTION']
      const departmentCode = row['CODE DEPARTEMENT']
      const activityName = row['ACTIVITES']
      const sousActivityName = row['SOUS ACTVITES']
      const tacheName = row['TACHES']
      const costCode = row['COST CODE']; // ✅ UNIQUE KEY
      // Basic validation: must have department, activity, tache, and cost code
      if (!costCode || !departmentName || !activityName || !tacheName) {
        skipped++;
        continue;
      }

      validCostCodes.add(costCode);

      const result = await this.upsertHierarchy(
        departmentName,
        activityName,
        sousActivityName,
        tacheName,
        costCode,
        departmentCode
      );

      result.created ? created++ : updated++;
    }

    // 🔥 MERGE DUPLICATES (safe, bottom-up)
    const merged = await this.removeDuplicateRecords();

    // 🔥 SAFE CLEANUP (budget-aware)
    // const removedTaches = await this.removeUnusedTaches(validCostCodes);
    // const removedSous = await this.removeEmptySousActivities();
    // const removedActivities = await this.removeEmptyActivities();
    // const removedDepartments = await this.removeEmptyDepartments();

    return {
      created,
      updated,
      skipped,
      removed: {

        merged,
      },
    };
  }

  /* ----------------------------------------------------
     UPSERT LOGIC
  ---------------------------------------------------- */
  private async upsertHierarchy(
    departmentName: string,
    activityName: string,
    sousActivityName: string | null,
    tacheName: string,
    costCode: string,
    departmentCode: string | null,

  ) {
    console.log("departmentName", departmentName, departmentCode)
    departmentName = departmentName === "FINANCE" ? "CAPEX" : departmentName;
    /* ---------- Department ---------- */
    let department = await this.departmentRepo.findOne({
      where: { name: departmentName },
    });

    if (!department) {
      department = this.departmentRepo.create({
        name: departmentName,
        code: departmentCode
      });
      await this.departmentRepo.save(department);
    }

    /* ---------- Activity ---------- */
    let activity = await this.activityRepo.findOne({
      where: {
        name: activityName,
        department: { id: department.id },
      },
      relations: ['department'],
    });

    if (!activity) {
      activity = this.activityRepo.create({
        name: activityName,
        department,
      });
      await this.activityRepo.save(activity);
    }

    /* ---------- Sous Activity ---------- */
    let sousActivity: BudgetSousActivity | null = null;

    if (sousActivityName) {
      sousActivity = await this.sousActivityRepo.findOne({
        where: {
          name: sousActivityName,
          activity: { id: activity.id },
        },
        relations: ['activity', 'department'],
      });

      if (!sousActivity) {
        sousActivity = this.sousActivityRepo.create({
          name: sousActivityName,

          activity,
          department,
        });
        await this.sousActivityRepo.save(sousActivity);
      }
    }

    /* ---------- Tache (COST CODE = COLUMN K) ---------- */
    let tache = await this.tacheRepo.findOne({
      where: { costCode },
      relations: ['department', 'activity', 'sousActivity'],
    });

    let created = false;

    if (!tache) {
      tache = this.tacheRepo.create({
        costCode,
        name: tacheName,
        department,
        activity,
        sousActivity: sousActivity ?? null,
      });
      await this.tacheRepo.save(tache);
      created = true;
    } else {
      tache.name = tacheName;
      tache.department = department;
      tache.activity = activity;
      tache.sousActivity = sousActivity ?? null;
      await this.tacheRepo.save(tache);
    }

    return { created };
  }

  /* ----------------------------------------------------
     SAFE CLEANUP (BUDGET AWARE)
  ---------------------------------------------------- */

  private async removeUnusedTaches(validCostCodes: Set<string>) {
    const taches = await this.tacheRepo.find({
      relations: ['budgets'],
    });

    const toDelete = taches.filter(
      t =>
        !validCostCodes.has(t.costCode) &&
        (!t.budgets || t.budgets.length === 0),
    );

    if (toDelete.length) {
      const ids = toDelete.map(t => t.id);
      await this.dataSource
        .createQueryBuilder()
        .update('budget_tache')
        .set({ deleted_at: () => 'CURRENT_TIMESTAMP' })
        .whereInIds(ids)
        .execute();
    }

    return toDelete.length;
  }

  private async removeEmptySousActivities() {
    const list = await this.sousActivityRepo.find({
      relations: ['taches', 'budgets'],
    });

    const toDelete = list.filter(
      sa =>
        (!sa.taches || sa.taches.length === 0) &&
        (!sa.budgets || sa.budgets.length === 0),
    );

    if (toDelete.length) {
      const ids = toDelete.map(s => s.id);
      await this.dataSource
        .createQueryBuilder()
        .update('budget_sous_activity')
        .set({ deleted_at: () => 'CURRENT_TIMESTAMP' })
        .whereInIds(ids)
        .execute();
    }

    return toDelete.length;
  }

  private async removeEmptyActivities() {
    const list = await this.activityRepo.find({
      relations: ['sousActivities', 'budgets'],
    });

    const toDelete = list.filter(
      a =>
        (!a.sousActivities || a.sousActivities.length === 0) &&
        (!a.budgets || a.budgets.length === 0),
    );

    if (toDelete.length) {
      const ids = toDelete.map(a => a.id);
      await this.dataSource
        .createQueryBuilder()
        .update('budget_activity')
        .set({ deleted_at: () => 'CURRENT_TIMESTAMP' })
        .whereInIds(ids)
        .execute();
    }

    return toDelete.length;
  }

  private async removeEmptyDepartments() {
    const departments = await this.departmentRepo.find({
      relations: ['activities'],
    });

    const budgets = await this.budgetRepo.find({
      relations: ['department', 'assignedDepartment'],
      select: ['id'],
    });

    const protectedIds = new Set<number>();
    budgets.forEach(b => {
      if (b.department && (b.department as any).id) protectedIds.add((b.department as any).id);
      if (b.assignedDepartment && (b.assignedDepartment as any).id) protectedIds.add((b.assignedDepartment as any).id);
    });

    const toDelete = departments.filter(
      d =>
        (!d.activities || d.activities.length === 0) &&
        !protectedIds.has(d.id),
    );

    if (toDelete.length) {
      const ids = toDelete.map(d => d.id);
      await this.dataSource
        .createQueryBuilder()
        .update('department')
        .set({ deleted_at: () => 'CURRENT_TIMESTAMP' })
        .whereInIds(ids)
        .execute();
    }

    return toDelete.length;
  }

  /**
   * Merge duplicate records in the hierarchy tables.
   * Safe bottom-up merge: taches -> sousActivities -> activities -> departments
   */
  async removeDuplicateRecords() {
    const normalize = (s: string | null | undefined) => {
      if (s === undefined || s === null) return null;
      const v = String(s).trim().toLowerCase();
      return v === '' ? null : v;
    };

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    const summary = { taches: 0, sous: 0, activities: 0, departments: 0 };
    try {
      // Taches: merge by costCode
      const allTaches = await this.tacheRepo.find({ relations: ['budgets'] });
      const byCost = new Map<string, typeof allTaches>();
      for (const t of allTaches) {
        const k = normalize(t.costCode);
        if (!k) continue;
        const arr = byCost.get(k) || [];
        arr.push(t);
        byCost.set(k, arr);
      }

      for (const [k, group] of byCost.entries()) {
        if (group.length <= 1) continue;
        group.sort((a, b) => a.id - b.id);
        const keeper = group.find(g => g.budgets && g.budgets.length > 0) || group[0];
        const toMerge = group.filter(g => g.id !== keeper.id);
        for (const other of toMerge) {
          await qr.manager.query('UPDATE budget SET tache_id = ? WHERE tache_id = ?', [keeper.id, other.id]);
          await qr.manager.query('DELETE FROM budget_tache WHERE id = ?', [other.id]);
          summary.taches++;
        }
      }

      // Sous activities: merge by activityId + name
      const allSous = await this.sousActivityRepo.find({ relations: ['taches', 'budgets', 'activity'] });
      const sousMap = new Map<string, typeof allSous>();
      for (const s of allSous) {
        const actId = s.activity ? (s.activity as any).id : null;
        const key = `${actId ?? 'null'}||${normalize(s.name) ?? ''}`;
        const arr = sousMap.get(key) || [];
        arr.push(s);
        sousMap.set(key, arr);
      }

      for (const [key, group] of sousMap.entries()) {
        if (group.length <= 1) continue;
        group.sort((a, b) => a.id - b.id);
        const keeper = group.find(g => (g.taches && g.taches.length > 0) || (g.budgets && g.budgets.length > 0)) || group[0];
        const toMerge = group.filter(g => g.id !== keeper.id);
        for (const other of toMerge) {
          await qr.manager.query('UPDATE budget_tache SET sous_activity_id = ? WHERE sous_activity_id = ?', [keeper.id, other.id]);
          await qr.manager.query('UPDATE budget SET sous_activity_id = ? WHERE sous_activity_id = ?', [keeper.id, other.id]);
          await qr.manager.query('DELETE FROM budget_sous_activity WHERE id = ?', [other.id]);
          summary.sous++;
        }
      }

      // Activities: merge by departmentId + name
      const allActs = await this.activityRepo.find({ relations: ['sousActivities', 'budgets', 'department'] });
      const actMap = new Map<string, typeof allActs>();
      for (const a of allActs) {
        const deptId = a.department ? (a.department as any).id : null;
        const key = `${deptId ?? 'null'}||${normalize(a.name) ?? ''}`;
        const arr = actMap.get(key) || [];
        arr.push(a);
        actMap.set(key, arr);
      }

      for (const [key, group] of actMap.entries()) {
        if (group.length <= 1) continue;
        group.sort((a, b) => a.id - b.id);
        const keeper = group.find(g => (g.sousActivities && g.sousActivities.length > 0) || (g.budgets && g.budgets.length > 0)) || group[0];
        const toMerge = group.filter(g => g.id !== keeper.id);
        for (const other of toMerge) {
          // 1) Move/merge sous-activities: prefer merging by normalized name
          const sousForOther: Array<{ id: number; name: string | null }> = await qr.manager.query(
            'SELECT id, name FROM budget_sous_activity WHERE activity_id = ?',
            [other.id],
          );

          for (const s of sousForOther) {
            const sNorm = normalize(s.name);
            if (sNorm) {
              const existing = await qr.manager.query(
                'SELECT id FROM budget_sous_activity WHERE activity_id = ? AND LOWER(TRIM(name)) = ? LIMIT 1',
                [keeper.id, sNorm],
              );
              if (existing && existing.length) {
                const existId = existing[0].id;
                await qr.manager.query('UPDATE budget_tache SET sous_activity_id = ? WHERE sous_activity_id = ?', [existId, s.id]);
                await qr.manager.query('UPDATE budget SET sous_activity_id = ? WHERE sous_activity_id = ?', [existId, s.id]);
                await qr.manager.query('DELETE FROM budget_sous_activity WHERE id = ?', [s.id]);
                continue;
              }
            }
            // no matching sous in keeper -> reassign to keeper
            await qr.manager.query('UPDATE budget_sous_activity SET activity_id = ? WHERE id = ?', [keeper.id, s.id]);
          }

          // 2) Move/merge taches under activity: prefer merging by cost_code
          const tachesForOther: Array<{ id: number; cost_code: string | null }> = await qr.manager.query(
            'SELECT id, cost_code FROM budget_tache WHERE activity_id = ?',
            [other.id],
          );

          for (const t of tachesForOther) {
            const costNorm = normalize(t.cost_code);
            if (costNorm) {
              const existingT = await qr.manager.query(
                'SELECT id FROM budget_tache WHERE activity_id = ? AND LOWER(TRIM(cost_code)) = ? LIMIT 1',
                [keeper.id, costNorm],
              );
              if (existingT && existingT.length) {
                const existTid = existingT[0].id;
                await qr.manager.query('UPDATE budget SET tache_id = ? WHERE tache_id = ?', [existTid, t.id]);
                await qr.manager.query('DELETE FROM budget_tache WHERE id = ?', [t.id]);
                continue;
              }
            }
            // reassign tache to keeper activity
            await qr.manager.query('UPDATE budget_tache SET activity_id = ? WHERE id = ?', [keeper.id, t.id]);
          }

          // 3) Reassign any budgets directly pointing to the activity
          await qr.manager.query('UPDATE budget SET activity_id = ? WHERE activity_id = ?', [keeper.id, other.id]);

          // 4) delete old activity
          await qr.manager.query('DELETE FROM budget_activity WHERE id = ?', [other.id]);
          summary.activities++;
        }
      }

      // Departments: merge by name
      const allDepts = await this.departmentRepo.find({ relations: ['activities'] });
      const deptMap = new Map<string, typeof allDepts>();
      for (const d of allDepts) {
        const key = normalize(d.name) ?? '';
        const arr = deptMap.get(key) || [];
        arr.push(d);
        deptMap.set(key, arr);
      }

      for (const [key, group] of deptMap.entries()) {
        if (group.length <= 1) continue;
        group.sort((a, b) => a.id - b.id);
        const keeper = group.find(g => (g.activities && g.activities.length > 0)) || group[0];
        const toMerge = group.filter(g => g.id !== keeper.id);
        for (const other of toMerge) {
          await qr.manager.query('UPDATE budget_activity SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
          await qr.manager.query('UPDATE budget_tache SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
          await qr.manager.query('UPDATE budget_sous_activity SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
          await qr.manager.query('UPDATE budget SET department_id = ? WHERE department_id = ?', [keeper.id, other.id]);
          await qr.manager.query('UPDATE budget SET assigned_department_id = ? WHERE assigned_department_id = ?', [keeper.id, other.id]);
          await qr.manager.query('DELETE FROM department WHERE id = ?', [other.id]);
          summary.departments++;
        }
      }

      await qr.commitTransaction();
      await qr.release();
      return summary;
    } catch (err) {
      await qr.rollbackTransaction();
      await qr.release();
      throw err;
    }
  }
}
