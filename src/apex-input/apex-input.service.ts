import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApexInput } from './apex-input.entity';
import { Budget } from '../budget/entities/budget.entity';
import { Department } from '../department/entities/department.entity';
import { BudgetActivity } from '../budget/entities/budget-activity.entity';
import QueryApexInputDto from './dto/query-apex-input.dto';

@Injectable()
export class ApexInputService {
  constructor(
    @InjectRepository(ApexInput) private repo: Repository<ApexInput>,
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(BudgetActivity) private activityRepo: Repository<BudgetActivity>,
  ) { }

  // Annual summary aggregated by department (paginated)
  async annualSummary(page = 1, pageSize = 10, deptCode?: string) {
    const pageNum = Math.max(1, Number(page));
    const limit = Math.min(200, Number(pageSize) || 10);
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
      const bRow = await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS budget FROM budget WHERE department_id = ?`, [d.id]);
      const rRow = await this.repo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS realisation FROM apex_input WHERE department_id = ?`, [d.id]);
      const budget = Number(bRow && bRow[0] ? bRow[0].budget : 0);
      const realisation = Number(rRow && rRow[0] ? rRow[0].realisation : 0);
      const percentage = budget > 0 ? Number(((realisation / budget) * 100).toFixed(2)) : 0;

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

  async yearlyBudget(filters: {
    category?: string;
    department?: string;
    min_budget?: number;
    max_budget?: number;
    min_realisation?: number;
    max_realisation?: number;
    sort_by?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) {
    // aggregate budgets by category + department
    const budgetRows: any[] = await this.budgetRepo.query(
      `SELECT COALESCE(b.categorie_grade,'') AS category,
         COALESCE(d.name, COALESCE(b.departement, '')) AS department,
         COALESCE(SUM(COALESCE(b.total_budget_usd,0)),0) AS budget
       FROM budget b
       LEFT JOIN department d ON d.id = b.department_id
       GROUP BY b.categorie_grade, d.name, b.departement`
    );

    // aggregate realisations from apex_input by category + department
    // Use SUM per month to avoid nested expression issues in some MySQL versions
    const apexRows: any[] = await this.repo.query(
      `SELECT COALESCE(a.categorie_grade,'') AS category,
         COALESCE(d.name, COALESCE(a.departement, '')) AS department,
         COALESCE(
           SUM(COALESCE(a.jan,0)) + SUM(COALESCE(a.feb,0)) + SUM(COALESCE(a.mar,0)) + SUM(COALESCE(a.apr,0)) + SUM(COALESCE(a.may,0)) + SUM(COALESCE(a.jun,0)) +
           SUM(COALESCE(a.jul,0)) + SUM(COALESCE(a.aug,0)) + SUM(COALESCE(a.sep,0)) + SUM(COALESCE(a.oct,0)) + SUM(COALESCE(a.nov,0)) + SUM(COALESCE(a. dec,0)),
         0
         ) AS realisation
       FROM apex_input a
       LEFT JOIN department d ON d.id = a.department_id
       GROUP BY a.categorie_grade, d.name, a.departement`
    );

    const map = new Map<string, { category: string; department: string; budget: number; realisation: number }>();

    // debug small sample
    try { console.debug('yearlyBudget budgetRows sample:', budgetRows && budgetRows.slice(0, 5)); } catch (e) { }

    for (const b of budgetRows) {
      const key = `${(b.category || '').toString().toLowerCase()}||${(b.department || '').toString().toLowerCase()}`;
      const raw = b.budget;
      const budgetVal = Number(String(raw).replace(/[^0-9.-]+/g, '')) || 0;
      map.set(key, { category: b.category || null, department: b.department || null, budget: budgetVal, realisation: 0 });
    }
    for (const a of apexRows) {
      const key = `${(a.category || '').toString().toLowerCase()}||${(a.department || '').toString().toLowerCase()}`;
      const existing = map.get(key);
      const rawA = a.realisation;
      const realVal = Number(String(rawA).replace(/[^0-9.-]+/g, '')) || 0;
      if (existing) {
        existing.realisation = realVal;
      } else {
        map.set(key, { category: a.category || null, department: a.department || null, budget: 0, realisation: realVal });
      }
    }

    let rows = Array.from(map.values());

    // apply filters
    if (filters.category) rows = rows.filter(r => (r.category || '').toString().toLowerCase() === filters.category.toString().toLowerCase());
    if (filters.department) rows = rows.filter(r => (r.department || '').toString().toLowerCase() === filters.department.toString().toLowerCase());
    if (typeof filters.min_budget === 'number') rows = rows.filter(r => r.budget >= filters.min_budget);
    if (typeof filters.max_budget === 'number') rows = rows.filter(r => r.budget <= filters.max_budget);
    if (typeof filters.min_realisation === 'number') rows = rows.filter(r => r.realisation >= filters.min_realisation);
    if (typeof filters.max_realisation === 'number') rows = rows.filter(r => r.realisation <= filters.max_realisation);

    // sort
    const sortField = filters.sort_by === 'realisation' ? 'realisation' : filters.sort_by === 'budget' ? 'budget' : undefined;
    if (sortField) {
      const dir = (filters.order || 'DESC').toUpperCase() === 'ASC' ? 1 : -1;
      rows.sort((a, b) => (a[sortField] - b[sortField]) * dir);
    }

    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Number(filters.limit || rows.length));
    const start = (page - 1) * limit;
    const paged = rows.slice(start, start + limit);

    return { total: rows.length, page, limit, data: paged };
  }

  // Department monthly breakdown by activity
  async departmentMonthly(departmentCode: string, yearOrOpts: number | { year?: number; period?: string; start?: string; end?: string } = {}) {
    const dr = await this.deptRepo.query('SELECT id, code, name FROM department WHERE code = ? LIMIT 1', [departmentCode]);
    if (!dr || dr.length === 0) return { data: null };
    const d = dr[0];

    const totalRow = await this.budgetRepo.query(`SELECT COALESCE(SUM(total_budget_usd),0) AS totalBudget FROM budget WHERE department_id = ?`, [d.id]);
    const totalBudget = Number(totalRow && totalRow[0] ? totalRow[0].totalBudget : 0);

    const salaryRow = await this.budgetRepo.query(
      `SELECT COALESCE(SUM(total_budget_usd),0) AS salaryAmount FROM budget WHERE department_id = ? AND (LOWER(texte_libelle) LIKE ? OR LOWER(account_ohada) LIKE ?)`,
      [d.id, '%salaire%', '%salary%'],
    );
    const salaryAmount = Number(salaryRow && salaryRow[0] ? salaryRow[0].salaryAmount : 0);

    const acts = await this.activityRepo.query(`SELECT id, name FROM budget_activity WHERE department_id = ?`, [d.id]);

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

    for (const a of acts) {
      // select only requested months to reduce payload
      const monthSelect = monthsToReturn.map(m => 'COALESCE(SUM(`' + m.key + '`),0) AS `' + m.key + '`').join(', ');
      const bRow = await this.budgetRepo.query(`SELECT ${monthSelect} FROM budget WHERE activity_id = ?`, [a.id]);
      const rRow = await this.repo.query(`SELECT ${monthSelect} FROM apex_input WHERE activity_id = ?`, [a.id]);

      const monthly: Record<string, { budget: number; realisation: number }> = {};
      for (const mInfo of monthsToReturn) {
        const m = mInfo.key;
        const label = mInfo.label;
        const bVal = bRow && bRow[0] && bRow[0][m] ? Number(bRow[0][m]) : 0;
        const rVal = rRow && rRow[0] && rRow[0][m] ? Number(rRow[0][m]) : 0;
        monthly[label] = { budget: bVal, realisation: rVal };
      }

      activities.push({ activity: a.name || null, monthly });
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

      return {
        costCenter: responseCostCenter,
        totalUnits,
        totalBudgetUsd,
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
}

export default ApexInputService;
