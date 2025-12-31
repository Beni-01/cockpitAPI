import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApexInput } from './apex-input.entity';
import QueryApexInputDto from './dto/query-apex-input.dto';

@Injectable()
export class ApexInputService {
  constructor(@InjectRepository(ApexInput) private repo: Repository<ApexInput>) { }

  async findAll(query: QueryApexInputDto) {
    const qb = this.repo.createQueryBuilder('a');

    // resolve tache id from cost_center or resolve cost_code from tache id
    let resolvedTacheId: number | null = query.tache_id ? Number(query.tache_id) : null;
    let resolvedCostCode: string | null = null;
    if (!resolvedTacheId && query.cost_center) {
      const rows = await this.repo.query('SELECT id FROM `budget_tache` WHERE `cost_code` = ? LIMIT 1', [query.cost_center]);
      if (rows && rows.length) resolvedTacheId = rows[0].id;
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
        // department_id, activity_id and sous_activity_id intentionally omitted
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
