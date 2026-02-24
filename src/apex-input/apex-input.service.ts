import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApexInput } from './apex-input.entity';
import { Budget } from '../budget/entities/budget.entity';
import { Department } from '../department/entities/department.entity';
import { BudgetActivity } from '../budget/entities/budget-activity.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Category } from '../category/entities/category.entity';
import QueryApexInputDto from './dto/query-apex-input.dto';
import { BudgetTache } from 'src/budget/entities/budget-tache.entity';

@Injectable()
export class ApexInputService {
  constructor(
    @InjectRepository(ApexInput) private repo: Repository<ApexInput>,
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(BudgetActivity) private activityRepo: Repository<BudgetActivity>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(BudgetTache) private tacheRepo: Repository<BudgetTache>,
  ) { }

  // Annual summary aggregated by department (paginated)
  async annualSummary(page = 1, pageSize = 20, deptCode?: string) {
    const pageNum = Math.max(1, Number(page));
    const limit = Math.min(200, Number(pageSize) || 20);
    const offset = (pageNum - 1) * limit;

    const params: any[] = [];
    const whereDept = deptCode ? 'WHERE d.code = ?' : '';
    if (deptCode) params.push(deptCode);

    const totalAnnualRow = await this.budgetRepo.query(
      `SELECT COALESCE(SUM(total_budget_usd),0) AS total FROM budget b
       LEFT JOIN department d ON d.id = b.department_id
       ${whereDept}`,
      params,
    );
    const totalAnnualAlldepartment = Number(totalAnnualRow && totalAnnualRow[0] ? totalAnnualRow[0].total : 0);

    const deptRows = await this.deptRepo.query(
      `SELECT d.id, d.code AS departmentCode, d.name AS departmentName
       FROM department d
       ${whereDept}
       ORDER BY d.name LIMIT ? OFFSET ?`,
      deptCode ? [deptCode, limit, offset] : [limit, offset],
    );

    const countRows = await this.deptRepo.query(
      `SELECT COUNT(*) AS cnt FROM department d ${whereDept}`,
      deptCode ? [deptCode] : [],
    );
    const totalItems = Number(countRows && countRows[0] ? countRows[0].cnt : 0);

    const departmentData: any[] = [];
    for (const d of deptRows) {
      console.log("department", d)
      const bRow = d.departmentCode === "RH" ? await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS budget FROM budget WHERE department_id = ? AND assigned_department_id IS ?`, [d.id, null]) : await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS budget FROM budget WHERE department_id = ?`, [d.id]);
      let rRow = []
      if (d.departmentCode === "RH") {
        rRow = await this.transactionRepo.query(
          `SELECT COALESCE(SUM(t.depense),0) AS realisation 
         FROM transaction t 
         INNER JOIN budget b ON t.centreId = b.id 
         WHERE b.department_id = ? AND b.assigned_department_id = ? AND t.deletedAt IS NULL` ,
          [d.id, d.id]
        );
      } else {
        rRow = await this.transactionRepo.query(
          `SELECT COALESCE(SUM(t.depense),0) AS realisation 
         FROM transaction t 
         INNER JOIN budget b ON t.centreId = b.id 
         WHERE b.department_id = ? AND t.deletedAt IS NULL` ,
          [d.id]
        );
      }
      const budget = Number(bRow && bRow[0] ? bRow[0].budget : 0);
      const realisation = Number(rRow && rRow[0] ? rRow[0].realisation : 0);
      const percentage = budget > 0 ? Number(((realisation / budget) * 100).toFixed(2)) : 0;
      console.log("department budget", d.departmentCode, budget, realisation, percentage)
      const actRow = await this.activityRepo.query(`SELECT name FROM budget_activity WHERE department_id = ? LIMIT 1`, [d.id]);
      const activity = actRow && actRow[0] ? actRow[0].name : null;

      departmentData.push({
        id: String(d.id),
        departmentCode: d.departmentCode,
        departmentName: d.departmentName,
        activity,
        budget,
        realisation,
        percentage,
      });
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      totalAnnualAlldepartment,
      pagination: {
        page: Math.max(0, pageNum - 1),
        pageSize: limit,
        totalItems,
        totalPages,
      },
      departmentData,
    };
  }


  // Department monthly breakdown by activity
  async departmentMonthly(departmentCode: string, yearOrOpts: number | { year?: number; period?: string; start?: string; end?: string } = {}) {
    const dr = await this.deptRepo.query('SELECT id, code, name FROM department WHERE code = ? LIMIT 1', [departmentCode]);
    if (!dr || dr.length === 0) return { data: null };
    const d = dr[0];

    const totalRow = d.code === "RH" ? await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS totalBudget FROM budget WHERE department_id = ? AND assigned_department_id IS ?`, [d.id, null]) : await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS totalBudget FROM budget WHERE department_id = ?`, [d.id]);
    const totalBudget = Number(totalRow && totalRow[0] ? totalRow[0].totalBudget : 0);


    // Calculate HR (salary) planned totals from the budget table.
    // Prefer department's own RH budgets; if none, use budgets assigned to this department.

    const assignedSalaryRow = await this.budgetRepo.query(
      `SELECT COALESCE(SUM(total_budget_usd),0) AS salary FROM budget WHERE assigned_department_id = ? AND UPPER(cost_center) LIKE 'RH%'`,
      [d.id],
    );
    const assignedSalary = Number(assignedSalaryRow && assignedSalaryRow[0] ? assignedSalaryRow[0].salary : 0);
    const salaryAmount = assignedSalary || 0;

    let activitiesDb = await this.activityRepo.query(`SELECT id, name FROM budget_activity WHERE department_id = ?`, [d.id]);

    const activities: any[] = [];
    const allMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // normalize inputs
    let requestedYear: number;
    let period: string | undefined;
    let start: string | undefined;
    let end: string | undefined;
    if (typeof yearOrOpts === 'number') {
      requestedYear = yearOrOpts;
    } else {
      requestedYear = yearOrOpts.year || new Date().getFullYear();
      period = yearOrOpts.period;
      start = yearOrOpts.start;
      end = yearOrOpts.end;
    }

    // build months to return: array of { key: 'jan', label: 'Jan 2025' }
    const monthsToReturn: Array<{ key: string; label: string }> = [];
    const now = new Date();

    if (period === 'last_month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const idx = lm.getMonth();
      monthsToReturn.push({ key: allMonths[idx], label: `${monthLabels[idx]} ${lm.getFullYear()}` });
    } else if (period === 'quarter') {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      for (let i = qStart; i < qStart + 3; i++) {
        const idx = i % 12;
        monthsToReturn.push({ key: allMonths[idx], label: `${monthLabels[idx]} ${now.getFullYear()}` });
      }
    } else if (period === 'current') {
      const idx = now.getMonth();
      monthsToReturn.push({ key: allMonths[idx], label: `${monthLabels[idx]} ${now.getFullYear()}` });
    } else if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      const cur = new Date(s.getFullYear(), s.getMonth(), 1);
      const endMonth = new Date(e.getFullYear(), e.getMonth(), 1);
      while (cur <= endMonth) {
        const idx = cur.getMonth();
        monthsToReturn.push({ key: allMonths[idx], label: `${monthLabels[idx]} ${cur.getFullYear()}` });
        cur.setMonth(cur.getMonth() + 1);
      }
    } else {
      // default: full year
      for (let i = 0; i < allMonths.length; i++) {
        monthsToReturn.push({ key: allMonths[i], label: `${monthLabels[i]} ${requestedYear}` });
      }
    }
    let acts = []
    if (departmentCode === "RH") {
      activitiesDb?.map((a: any) => {
        console.log("activity", a.name)
        if (a.name.toLowerCase().includes("renumeration_ressources humaines")) {
          acts.push(a)
        }
        if (!a.name.toLowerCase().includes("renumeration")) {
          acts.push(a)
        }
      })
    } else {
      acts = activitiesDb;
    }
    console.log("acts", activities, acts)

    for (const a of acts) {


      // select only requested months to reduce payload (aggregated sums)
      // If no months were requested (defensive), fall back to a single total column
      let monthSelect = '';
      if (monthsToReturn && monthsToReturn.length) {
        monthSelect = monthsToReturn.map(m => 'COALESCE(SUM(`' + m.key + '`),0) AS `' + m.key + '`').join(', ');
      } else {
        monthSelect = `COALESCE(SUM(total_budget_usd),0) AS totalBudget`;
      }
      // aggregate budgets for this activity (or tache for RH special-case)
      // use case-insensitive LIKE for description_cc matches
      // match description_cc examples like
      // "RESSOURCES HUMAINES _ Renumeration_Etudes _ Renumeration_Etudes _ Renumeration_Etudes"
      // use a case-insensitive wildcard match on the activity name OR on the pattern {dept}_{activity}
      // and require RH cost_center
      let bRow = null
      let budgetCondition = 'b.activity_id = ?';
      let budgetParams: any[] = [a.id];
      if (a.name.toLowerCase() === "renumeration") {
        console.log("renumeration", a.name, d.id)

        bRow = await this.budgetRepo.query(
          `SELECT ${monthSelect} FROM budget WHERE assigned_department_id=?`,
          [d.id],
        )
        // budgetCondition = 'b.assigned_department_id = ?';
        budgetParams = [a.id];
      } else {
        bRow = await this.budgetRepo.query(`SELECT ${monthSelect} FROM budget WHERE activity_id = ?`, [a.id]);
      }
      console.log("activity", a, "budget row", bRow)
      // prepare a budget filtering condition and params for transaction queries

      if (a.name?.toLowerCase() === "renumeration_ressources humaines") {
        const tache = await this.tacheRepo.findOneBy({ name: a.name });
        bRow = await this.budgetRepo.query(`SELECT ${monthSelect} FROM budget WHERE tache_id = ? AND department_id = ? `, [tache.id, d.id]);
        budgetCondition = 'b.tache_id = ? AND b.department_id = ? AND b.assigned_department_id = ?';
        budgetParams = [tache.id, d.id, d.id];
      }
      // fetch matching budget ids so we can filter transactions by centreId (avoid non-aggregated columns)
      const budgetWhere = budgetCondition.replace(/b\./g, '');
      console.log("budgetWhere", budgetWhere, "budgetParams", budgetParams)
      const idRows: Array<{ id: number }> = await this.budgetRepo.query(`SELECT id FROM budget WHERE ${budgetWhere}`, budgetParams);
      const budgetIds = idRows && idRows.length ? idRows.map(r => r.id) : [];
      const monthly: Record<string, { budget: number; realisation: number }> = {};
      console.log("monthsToReturn", budgetIds)
      // First, populate budget values
      for (const mInfo of monthsToReturn) {
        const m = mInfo.key;
        const label = mInfo.label;
        const bVal = bRow && bRow[0] && bRow[0][m] ? Number(bRow[0][m]) : 0;
        monthly[label] = { budget: bVal, realisation: 0 };
      }

      // Then, calculate realisation from transactions grouped by month
      for (const mInfo of monthsToReturn) {
        const label = mInfo.label;
        const monthIndex = allMonths.indexOf(mInfo.key) + 1; // 1-based month
        let rRow: any = [];
        if (budgetIds.length) {
          const placeholders = budgetIds.map(() => '?').join(',');
          rRow = await this.transactionRepo.query(
            `SELECT COALESCE(SUM(t.depense),0) AS realisation
             FROM transaction t
             WHERE t.centreId IN (${placeholders})
             AND MONTH(t.createdAt) = ?
             AND YEAR(t.createdAt) = ?
             AND t.deletedAt IS NULL`,
             [...budgetIds, monthIndex, requestedYear],
          );
        } else {
          rRow = await this.transactionRepo.query(
            `SELECT COALESCE(SUM(t.depense),0) AS realisation
             FROM transaction t
             INNER JOIN budget b ON t.centreId = b.id
             WHERE ${budgetCondition}
             AND MONTH(t.createdAt) = ?
             AND YEAR(t.createdAt) = ? 
             AND t.deletedAt IS NULL`,
            [...budgetParams, monthIndex, requestedYear],
          );
        }
        // const rRow = await this.transactionRepo.query(
        //   `SELECT COALESCE(SUM(t.depense),0) AS realisation 
        //    FROM transaction t 
        //    INNER JOIN budget b ON t.centreId = b.id 
        //    WHERE b.activity_id = ? 
        //    AND MONTH(t.createdAt) = ? 
        //    AND YEAR(t.createdAt) = ?`,
        //   [a.id, monthIndex, requestedYear]
        // );
        const rVal = rRow && rRow[0] && rRow[0].realisation ? Number(rRow[0].realisation) : 0;
        monthly[label].realisation = rVal;
      }

      activities.push({ id: a.id, activity: a.name || null, sousActivity: a.sousActivity || null, monthly });

    }

    return {
      data: {
        departmentCode: d.code,
        departmentName: d.name,
        year: Number(requestedYear),
        totalBudget,
        salaryAmount,
        activities,
      },
    };
  }

  async findAll(query: QueryApexInputDto) {
    const qb = this.repo.createQueryBuilder('a');
    // resolve tache id from cost_center or resolve cost_code from tache id
    let resolvedTacheId: number | null = query.tache_id ? Number(query.tache_id) : null;
    let resolvedCostCode: string | null = null;
    console.log("query", !resolvedTacheId && query.cost_center)

    if (query.cost_center) {
      const rows = await this.repo.query('SELECT id FROM `budget_tache` WHERE `cost_code` = ? LIMIT 1', [query.cost_center]);
      if (rows && rows.length) {
        console.log('rows[0].id', rows[0].id)
        resolvedTacheId = rows[0].id;
        query.tache_id = rows[0].id;
      }
    }
    if (query.tache_id) {
      const rows2 = await this.repo.query('SELECT cost_code FROM `budget_tache` WHERE id = ? LIMIT 1', [query.tache_id]);
      if (rows2 && rows2.length) resolvedCostCode = rows2[0].cost_code;
    }

    if (query.cost_center) qb.andWhere('a.cost_center = :cost_center', { cost_center: query.cost_center });
    if (query.department_id) qb.andWhere('a.department_id = :department_id', { department_id: query.department_id });
    if (query.account_ohada) qb.andWhere('a.account_ohada = :account_ohada', { account_ohada: query.account_ohada });
    if (query.nature_depenses) qb.andWhere('LOWER(a.nature_depenses) LIKE :nature', { nature: `%${query.nature_depenses.toLowerCase()}%` });
    if (query.texte) {
      const t = `%${query.texte.toLowerCase()}%`;
      qb.andWhere('(LOWER(a.texte_libelle) LIKE :t OR LOWER(a.description_cc) LIKE :t OR LOWER(a.departement) LIKE :t)', { t });
    }
    if (resolvedTacheId && resolvedCostCode) {
      qb.andWhere('(a.tache_id = :tache_id OR a.cost_center = :cost_code)', { tache_id: resolvedTacheId, cost_code: resolvedCostCode });
    } else if (resolvedTacheId) {
      qb.andWhere('a.tache_id = :tache_id', { tache_id: resolvedTacheId });
    } else if (query.cost_center) {
      qb.andWhere('a.cost_center = :cost_center', { cost_center: query.cost_center });
    }

    const totalExpr = `(
      COALESCE(a.jan,0)+COALESCE(a.feb,0)+COALESCE(a.mar,0)+COALESCE(a.apr,0)+COALESCE(a.may,0)+COALESCE(a.jun,0)+
      COALESCE(a.jul,0)+COALESCE(a.aug,0)+COALESCE(a.sep,0)+COALESCE(a.oct,0)+COALESCE(a.nov,0)+COALESCE(a.dec,0)
    )`;

    if (query.min_total) qb.andWhere(`${totalExpr} >= :min_total`, { min_total: query.min_total });
    if (query.max_total) qb.andWhere(`${totalExpr} <= :max_total`, { max_total: query.max_total });
    // If caller requested a specific tache_id or cost_center, return an aggregated object
    if (query.tache_id || query.cost_center) {
      qb.addSelect(totalExpr, 'total_months');
      const apexRows = await qb.getMany();

      // determine primary cost center string for the response
      const responseCostCenter = query.cost_center || resolvedCostCode || null;

      // fetch budgets related to this tache or cost center
      const budgets = await this.repo.query('SELECT * FROM `budget` WHERE `tache_id` = ? OR `cost_center` = ?', [resolvedTacheId, responseCostCenter]);

      // compute totals from budgets (fallback to summing apex rows if budgets empty)
      let totalUnits = 0;
      let totalBudgetUsd = 0;
      if (budgets && budgets.length) {
        for (const b of budgets) {
          totalUnits += Number(b.total_units || 0);
          totalBudgetUsd += Number(b.total_budget_usd || 0);
        }
      } else {
        for (const a of apexRows) {
          const monthsTotal = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].reduce((s, m) => s + Number(a[m] || 0), 0);
          totalUnits += monthsTotal;
          totalBudgetUsd += monthsTotal;
        }
      }

      // resolve tache name
      let tacheName: string | null = null;
      if (resolvedTacheId) {
        const trow = await this.repo.query('SELECT name FROM `budget_tache` WHERE id = ? LIMIT 1', [resolvedTacheId]);
        if (trow && trow.length) tacheName = trow[0].name || null;
      } else {
        const trow2 = await this.repo.query('SELECT name FROM `budget_tache` WHERE cost_code = ? LIMIT 1', [query.cost_center]);
        if (trow2 && trow2.length) tacheName = trow2[0].name || null;
      }

      // map apex rows to clean objects
      const apexInputData = apexRows.map(a => ({
        id: a.id,
        cost_center: a.cost_center,
        description_cc: a.description_cc,
        province_ville: a.province_ville,
        coordinations_provinciales: a.coordinations_provinciales,
        local_etranger: a.local_etranger,
        nature_depenses: a.nature_depenses,
        account_ohada: a.account_ohada,
        departement: a.departement,
        texte_libelle: a.texte_libelle,
        cout_unitaire_auto: a.cout_unitaire_auto,
        cout_unitaire_manuel: a.cout_unitaire_manuel,
        total_units: a.total_units,
        totalBudgetUsd: a.total_budget_usd,
        unite_de_mesure: a.unite_de_mesure,
        categorie_grade: a.categorie_grade,
        totalUnits: a.total_units,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));

      // compute realisation totals from transactions for this tache or cost center
      let totalRealisationUsd = 0;
      const transRows = await this.transactionRepo.query(
        `SELECT COALESCE(SUM(t.depense),0) AS realisation
         FROM transaction t
         INNER JOIN budget b ON t.centreId = b.id
         WHERE (b.tache_id = ? OR b.cost_center = ?) AND t.deletedAt IS NULL`,
        [resolvedTacheId, responseCostCenter],
      );
      if (transRows && transRows[0]) totalRealisationUsd = Number(transRows[0].realisation || 0);

      return {
        costCenter: responseCostCenter,
        totalUnits,
        totalBudgetUsd,
        totalRealisationUsd,
        tache_name: tacheName,
        apexInputData,
        // budgets: budgets || [],
      };
    }

    const sortBy = query.sort_by || 'a.id';
    const order = (query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortBy, order as 'ASC' | 'DESC');

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(200, Number(query.limit) || 50);
    qb.skip((page - 1) * limit).take(limit);

    qb.addSelect(totalExpr, 'total_months');

    const [data, total] = await qb.getManyAndCount();

    // map paginated apex rows to sanitized objects (exclude monthly fields)
    const mapped = data.map(a => ({
      id: a.id,
      cost_center: a.cost_center,
      description_cc: a.description_cc,
      province_ville: a.province_ville,
      coordinations_provinciales: a.coordinations_provinciales,
      local_etranger: a.local_etranger,
      categorie_grade: a.categorie_grade,
      nature_depenses: a.nature_depenses,
      account_ohada: a.account_ohada,
      departement: a.departement,
      texte_libelle: a.texte_libelle,
      cout_unitaire_auto: a.cout_unitaire_auto,
      unite_de_mesure: a.unite_de_mesure,
      cout_unitaire_manuel: a.cout_unitaire_manuel,

      // monthly fields intentionally omitted
      tache_id: a.tache_id ?? null,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return { data: mapped, total, page, limit };
  }

  // Get category-wise budget with RH budget breakdown
  async getCategoryBudget(options: { period?: string; year?: number; categoryId?: number }) {
    const { period, year = new Date().getFullYear(), categoryId } = options;
    const now = new Date();

    // Determine date filter based on period
    let monthFilter = '';
    const params: any[] = [];

    if (period === 'current') {
      const currentMonth = now.getMonth() + 1;
      monthFilter = 'AND MONTH(b.createdAt) = ? AND YEAR(b.createdAt) = ?';
      params.push(currentMonth, year);
    } else if (period === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmMonth = lastMonth.getMonth() + 1;
      const lmYear = lastMonth.getFullYear();
      monthFilter = 'AND MONTH(b.createdAt) = ? AND YEAR(b.createdAt) = ?';
      params.push(lmMonth, lmYear);
    } else if (period === 'last_quarter') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
      const qsMonth = quarterStart.getMonth() + 1;
      const qeMonth = qsMonth + 2;
      monthFilter = 'AND MONTH(b.createdAt) BETWEEN ? AND ? AND YEAR(b.createdAt) = ?';
      params.push(qsMonth, qeMonth, year);
    }

    // Get all categories or specific category
    const categories = categoryId
      ? await this.categoryRepo.find({ where: { id: categoryId }, relations: ['departments'] })
      : await this.categoryRepo.find({ relations: ['departments'] });

    const categoryData: any[] = [];
    // hold split amounts for COMMUNICATION to merge into Fonctionnement/Operation
    const commSplit: { func?: any; op?: any } = {};

    for (const category of categories) {
      const departmentIds = category.departments.map(d => d.id);

      if (departmentIds.length === 0) {
        categoryData.push({
          categoryId: category.id,
          categoryName: category.name,
          totalBudget: 0,
          rhBudget: 0,
          otherBudget: 0,
          realisation: 0,
          percentage: 0,
        });
        continue;
      }

      const deptIdPlaceholders = departmentIds.map(() => '?').join(',');

      // Get total budget for all departments in this category using assigned_department_id
      const totalBudgetQuery = `
        SELECT COALESCE(SUM(b.total_budget_usd), 0) AS totalBudget 
        FROM budget b 
        WHERE b.department_id IN (${deptIdPlaceholders}) ${monthFilter}
      `;
      const totalBudgetResult = await this.budgetRepo.query(totalBudgetQuery, [...departmentIds, ...params]);
      const totalBudget = Number(totalBudgetResult?.[0]?.totalBudget || 0);

      // Get RH (Resources Humaines) budget - cost_center starts with 'RH'
      const rhBudgetQuery = `
        SELECT COALESCE(SUM(b.total_budget_usd), 0) AS rhBudget 
        FROM budget b 
        WHERE b.assigned_department_id IN (${deptIdPlaceholders}) 
        AND UPPER(b.cost_center) LIKE 'RH%' ${monthFilter}
      `;
      const rhBudgetResult = await this.budgetRepo.query(rhBudgetQuery, [...departmentIds, ...params]);
      const rhBudget = Number(rhBudgetResult?.[0]?.rhBudget || 0);

      // Get realisation from transactions
      const realisationQuery = `
        SELECT COALESCE(SUM(t.depense), 0) AS realisation 
        FROM transaction t 
        INNER JOIN budget b ON t.centreId = b.id 
        WHERE b.department_id IN (${deptIdPlaceholders}) ${monthFilter.replace('b.createdAt', 't.createdAt')}
      `;
      const realisationResult = await this.transactionRepo.query(realisationQuery, [...departmentIds, ...params]);
      const realisation = Number(realisationResult?.[0]?.realisation || 0);

      // Calculate percentage
      const percentage = totalBudget > 0 ? Number(((realisation / totalBudget) * 100).toFixed(2)) : 0;
      // HR (rh) and Other budgets

      // Get department details with their individual budgets
      const departmentDetails = [];
      for (const dept of category.departments) {
        const deptBudgetResult = dept.code === "RH" ? await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS budget FROM budget WHERE department_id = ? AND assigned_department_id IS ?`, [dept.id, null]) : await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS budget FROM budget WHERE department_id = ?`, [dept.id]);

        const deptBudget = Number(deptBudgetResult?.[0]?.budget || 0);

        const deptRhBudgetQuery = `
          SELECT COALESCE(SUM(b.total_budget_usd), 0) AS deptRhBudget 
          FROM budget b 
          WHERE b.assigned_department_id = ? 
          AND UPPER(b.cost_center) LIKE 'RH%' ${monthFilter}
        `;
        const deptRhBudgetResult = await this.budgetRepo.query(deptRhBudgetQuery, [dept.id, ...params]);
        const deptRhBudget = Number(deptRhBudgetResult?.[0]?.deptRhBudget || 0);

        let deptRealisationQuery = `
          SELECT COALESCE(SUM(t.depense), 0) AS deptRealisation 
          FROM transaction t 
          INNER JOIN budget b ON t.centreId = b.id 
          WHERE b.department_id = ? ${monthFilter.replace('b.createdAt', 't.createdAt')}
        `;
        let deptRealisationResult = null
        if (dept.code === "RH") {
          deptRealisationQuery = `
          SELECT COALESCE(SUM(t.depense), 0) AS deptRealisation 
          FROM transaction t 
          INNER JOIN budget b ON t.centreId = b.id 
          WHERE b.department_id = ? AND b.assigned_department_id = ? ${monthFilter.replace('b.createdAt', 't.createdAt')}
        `;
          deptRealisationResult = await this.transactionRepo.query(deptRealisationQuery, [dept.id, dept.id, ...params]);


        } else {
          deptRealisationResult = await this.transactionRepo.query(deptRealisationQuery, [dept.id, ...params]);

        }
        const deptRealisation = Number(deptRealisationResult?.[0]?.deptRealisation || 0);
        const deptOtherBudget = Math.max(0, deptBudget - deptRhBudget);

        departmentDetails.push({
          departmentId: dept.id,
          departmentCode: dept.code,
          departmentName: dept.name,
          categoryId: category.id,
          categoryName: category.name,
          budget: deptBudget,
          hr: deptRhBudget,
          otherBudget: deptOtherBudget,
          realisation: deptRealisation,
          percentage: deptBudget > 0 ? Number(((deptRealisation / deptBudget) * 100).toFixed(2)) : 0,
        });
      }

      // If this is the old COMMUNICATION category, split its CO department into
      // Fonctionnement (40%) and Operation (60%) and do not add COMMUNICATION itself.
      if ((category.name || '').toUpperCase() === 'COMMUNICATION') {
        const funcRatio = 0.4;
        const opRatio = 0.6;

        // find CO department details (if any) and split
        const funcDepartments: any[] = [];
        const opDepartments: any[] = [];
        for (const dd of departmentDetails) {
          if (dd.departmentCode === 'CO') {
            console.log("dd.budget", dd.budget)
            const funcBudget = Math.round((dd.budget || 0) * funcRatio);
            const opBudget = Math.round((dd.budget || 0) * opRatio);
            const funcHr = Math.round((dd.hr || 0) * funcRatio);
            const opHr = Math.round((dd.hr || 0) * opRatio);
            const funcOther = Math.max(0, funcBudget - funcHr);
            const opOther = Math.max(0, opBudget - opHr);

            funcDepartments.push({
              departmentId: dd.departmentId,
              departmentCode: dd.departmentCode,
              departmentName: dd.departmentName,
              categoryId: null,
              categoryName: 'Fonctionnement',
              budget: funcBudget,
              hr: funcHr,
              otherBudget: funcOther,
              realisation: Math.round((dd.realisation || 0) * funcRatio),
              percentage: funcBudget > 0 ? Number(((Math.round((dd.realisation || 0) * funcRatio) / funcBudget) * 100).toFixed(2)) : 0,
            });

            opDepartments.push({
              departmentId: dd.departmentId,
              departmentCode: dd.departmentCode,
              departmentName: dd.departmentName,
              categoryId: null,
              categoryName: 'Operation',
              budget: opBudget,
              hr: opHr,
              otherBudget: opOther,
              realisation: Math.round((dd.realisation || 0) * opRatio),
              percentage: opBudget > 0 ? Number(((Math.round((dd.realisation || 0) * opRatio) / opBudget) * 100).toFixed(2)) : 0,
            });
          }
        }

        commSplit.func = {
          categoryId: null,
          categoryName: 'Fonctionnement',
          totalBudget: Math.round(totalBudget * funcRatio),
          hr: Math.round(rhBudget * funcRatio),
          realisation: Math.round(realisation * funcRatio),
          percentage: Math.round(totalBudget * funcRatio) > 0 ? Number(((Math.round(realisation * funcRatio) / Math.round(totalBudget * funcRatio)) * 100).toFixed(2)) : 0,
          departments: funcDepartments,
        };

        commSplit.op = {
          categoryId: null,
          categoryName: 'Operation',
          totalBudget: Math.round(totalBudget * opRatio),
          hr: Math.round(rhBudget * opRatio),
          realisation: Math.round(realisation * opRatio),
          percentage: Math.round(totalBudget * opRatio) > 0 ? Number(((Math.round(realisation * opRatio) / Math.round(totalBudget * opRatio)) * 100).toFixed(2)) : 0,
          departments: opDepartments,
        };
        // do not push the COMMUNICATION category itself
      } else {
        categoryData.push({
          categoryId: category.id,
          categoryName: category.name,
          totalBudget,
          hr: rhBudget,
          realisation,
          percentage,
          departments: departmentDetails,
        });
      }
    }

    // Merge COMMUNICATION splits into existing Fonctionnement and Operation categories
    if (commSplit.func) {
      const funcIdx = categoryData.findIndex(c => (c.categoryName || '').toUpperCase() === 'FONCTIONNEMENT');
      if (funcIdx >= 0) {
        const target = categoryData[funcIdx];
        target.totalBudget = (target.totalBudget || 0) + (commSplit.func.totalBudget || 0);
        target.hr = (target.hr || 0) + (commSplit.func.hr || 0);
        target.realisation = (target.realisation || 0) + (commSplit.func.realisation || 0);
        target.departments = (target.departments || []).concat(commSplit.func.departments || []);
        target.percentage = target.totalBudget > 0 ? Number(((target.realisation / target.totalBudget) * 100).toFixed(2)) : 0;
      } else {
        categoryData.push(commSplit.func);
      }
    }
    if (commSplit.op) {
      const opIdx = categoryData.findIndex(c => (c.categoryName || '').toUpperCase() === 'OPERATION');
      if (opIdx >= 0) {
        const target = categoryData[opIdx];
        target.totalBudget = (target.totalBudget || 0) + (commSplit.op.totalBudget || 0);
        target.hr = (target.hr || 0) + (commSplit.op.hr || 0);
        target.realisation = (target.realisation || 0) + (commSplit.op.realisation || 0);
        target.departments = (target.departments || []).concat(commSplit.op.departments || []);
        target.percentage = target.totalBudget > 0 ? Number(((target.realisation / target.totalBudget) * 100).toFixed(2)) : 0;
      } else {
        categoryData.push(commSplit.op);
      }
    }

    // Calculate grand totals
    const grandTotal = categoryData.reduce((sum, cat) => sum + (cat.totalBudget || 0), 0);
    const grandTotalRH = categoryData.reduce((sum, cat) => sum + (cat.hr || 0), 0);
    const grandRealisation = categoryData.reduce((sum, cat) => sum + (cat.realisation || 0), 0);
    const grandPercentage = grandTotal > 0 ? Number(((grandRealisation / grandTotal) * 100).toFixed(2)) : 0;

    return {
      period: period || 'all',
      year,
      categories: categoryData,
      summary: {
        totalBudget: grandTotal,
        totalRhBudget: grandTotalRH,
        totalRealisation: grandRealisation,
        overallPercentage: grandPercentage,
      },
    };
  }

  // Return HR salary budget and realisation per department
  async getHrSalaryData(options?: { period?: string; year?: number; departmentId?: number; departmentCode?: string }) {
    const now = new Date();
    const period = options?.period;
    const year = options?.year || now.getFullYear();

    // build month filter for SQL if needed
    let monthFilter = '';
    const paramsExtra: any[] = [];
    if (period === 'current') {
      const currentMonth = now.getMonth() + 1;
      monthFilter = 'AND MONTH(b.createdAt) = ? AND YEAR(b.createdAt) = ?';
      paramsExtra.push(currentMonth, year);
    } else if (period === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmMonth = lastMonth.getMonth() + 1;
      const lmYear = lastMonth.getFullYear();
      monthFilter = 'AND MONTH(b.createdAt) = ? AND YEAR(b.createdAt) = ?';
      paramsExtra.push(lmMonth, lmYear);
    } else if (period === 'last_quarter') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
      const qsMonth = quarterStart.getMonth() + 1;
      const qeMonth = qsMonth + 2;
      monthFilter = 'AND MONTH(b.createdAt) BETWEEN ? AND ? AND YEAR(b.createdAt) = ?';
      paramsExtra.push(qsMonth, qeMonth, year);
    }

    // fetch departments: apply department filters if provided
    let depts: any[] = [];
    if (options?.departmentId) {
      const r = await this.deptRepo.query('SELECT id, code, name FROM department WHERE id = ? LIMIT 1', [options.departmentId]);
      depts = r || [];
    } else if (options?.departmentCode) {
      const r = await this.deptRepo.query('SELECT id, code, name FROM department WHERE code = ? LIMIT 1', [options.departmentCode]);
      depts = r || [];
    } else {
      depts = await this.deptRepo.query('SELECT id, code, name FROM department');
    }

    const rows: Array<{ id: number; departmentName: string; departmentCode: string; hrSalaryBudget: number; hrSalaryRealisation: number }> = [];

    for (const d of depts) {
      // HR salary budgets where assigned_department_id = dept.id and cost_center starts with 'RH'
      const bQuery = `SELECT COALESCE(SUM(b.total_budget_usd),0) AS hrBudget FROM budget b WHERE b.assigned_department_id = ? AND UPPER(b.cost_center) LIKE 'RH%' ${monthFilter}`;
      const bParams = [d.id, ...paramsExtra];
      const bRow = await this.budgetRepo.query(bQuery, bParams);
      const hrBudget = Number(bRow && bRow[0] ? bRow[0].hrBudget || 0 : 0);

      // Realisation from transactions linked to budgets assigned to this department and HR cost center
      // Use t.createdAt for transaction date filtering when monthFilter applies
      let rQuery = `SELECT COALESCE(SUM(t.depense),0) AS hrReal FROM transaction t INNER JOIN budget b ON t.centreId = b.id WHERE b.assigned_department_id = ? AND UPPER(b.cost_center) LIKE 'RH%'`;
      const rParams: any[] = [d.id];
      if (monthFilter) {
        // adapt monthFilter to use t.createdAt instead of b.createdAt
        const tMonthFilter = monthFilter.replace(/b\.createdAt/g, 't.createdAt');
        rQuery += ` ${tMonthFilter}`;
        rParams.push(...paramsExtra);
      }
      const rRow = await this.transactionRepo.query(rQuery, rParams);
      const hrReal = Number(rRow && rRow[0] ? rRow[0].hrReal || 0 : 0);

      rows.push({
        id: d.id,
        departmentName: d.name,
        departmentCode: d.code,
        hrSalaryBudget: hrBudget,
        hrSalaryRealisation: hrReal,
      });
    }

    return rows;
  }
}

export default ApexInputService;
