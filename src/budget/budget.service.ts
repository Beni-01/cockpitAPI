import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { QueryBudgetDto } from './dto/query-budget.dto';

@Injectable()
export class BudgetService {
  constructor(@InjectRepository(Budget) private repo: Repository<Budget>) {}

  async findAll(query: QueryBudgetDto) {
    const qb = this.repo.createQueryBuilder('b');

    if (query.cost_center) qb.andWhere('b.cost_center = :cost_center', { cost_center: query.cost_center });
    if (query.department_id) qb.andWhere('b.department_id = :department_id', { department_id: query.department_id });
    if (query.account_ohada) qb.andWhere('b.account_ohada = :account_ohada', { account_ohada: query.account_ohada });
    if (query.nature_depenses) qb.andWhere('LOWER(b.nature_depenses) LIKE :nature', { nature: `%${query.nature_depenses.toLowerCase()}%` });
    if (query.texte) {
      const t = `%${query.texte.toLowerCase()}%`;
      qb.andWhere('(LOWER(b.texte_libelle) LIKE :t OR LOWER(b.description_cc) LIKE :t OR LOWER(b.departement) LIKE :t)', { t });
    }

    if (query.tache_id) qb.andWhere('b.tache_id = :tache_id', { tache_id: query.tache_id });

    // total months expression
    const totalExpr = `(
      COALESCE(b.jan,0)+COALESCE(b.feb,0)+COALESCE(b.mar,0)+COALESCE(b.apr,0)+COALESCE(b.may,0)+COALESCE(b.jun,0)+
      COALESCE(b.jul,0)+COALESCE(b.aug,0)+COALESCE(b.sep,0)+COALESCE(b.oct,0)+COALESCE(b.nov,0)+COALESCE(b.dec,0)
    )`;

    if (query.min_total) {
      qb.andWhere(`${totalExpr} >= :min_total`, { min_total: query.min_total });
    }
    if (query.max_total) {
      qb.andWhere(`${totalExpr} <= :max_total`, { max_total: query.max_total });
    }

    // sorting
    const sortBy = query.sort_by || 'b.id';
    const order = (query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortBy, order as 'ASC' | 'DESC');

    // pagination
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Number(query.limit) || 25);
    qb.skip((page - 1) * limit).take(limit);

    // add total select for convenience
    qb.addSelect(totalExpr, 'total_months');

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  
}
