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
      const departmentName = this.clean(row['C']);
      const activityName = this.clean(row['D']);
      const sousActivityName = this.clean(row['E']);
      const tacheName = this.clean(row['F']);
      const costCode = this.clean(row['K']); // ✅ UNIQUE KEY

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
      );

      result.created ? created++ : updated++;
    }

    // 🔥 SAFE CLEANUP (budget-aware)
    const removedTaches = await this.removeUnusedTaches(validCostCodes);
    const removedSous = await this.removeEmptySousActivities();
    const removedActivities = await this.removeEmptyActivities();
    const removedDepartments = await this.removeEmptyDepartments();

    return {
      created,
      updated,
      skipped,
      removed: {
        taches: removedTaches,
        sousActivities: removedSous,
        activities: removedActivities,
        departments: removedDepartments,
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
  ) {
    /* ---------- Department ---------- */
    let department = await this.departmentRepo.findOne({
      where: { name: departmentName },
    });

    if (!department) {
      department = this.departmentRepo.create({
        name: departmentName,
        code: this.codeify(departmentName),
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
        code: this.codeify(activityName),
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
          code: this.codeify(sousActivityName),
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
      await this.tacheRepo.remove(toDelete);
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
      await this.sousActivityRepo.remove(toDelete);
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
      await this.activityRepo.remove(toDelete);
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
      await this.departmentRepo.remove(toDelete);
    }

    return toDelete.length;
  }
}
