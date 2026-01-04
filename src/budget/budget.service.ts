import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

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

  
  /** 1) Retourne la liste complète de toutes les données */
  async findAllRaw(): Promise<Budget[]> {
    return this.repo.find({ relations: ['department', 'transactions', 'activity'] });
  }

  /** 2) Création d'un Budget */
  async create(dto: CreateBudgetDto): Promise<Budget> {
    const budget = this.repo.create(dto);
    return this.repo.save(budget);
  }

  /** 3) Mise à jour d'un Budget */
  async update(id: number, dto: UpdateBudgetDto): Promise<Budget> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id }, relations: ['department', 'transactions'] });
  }

  /** 4) Retourner tout mais sélectionner uniquement certains champs */
  async findAllSelectFields(): Promise<Partial<Budget>[]> {
    return this.repo
      .createQueryBuilder('b')
      .select([
        'b.id',
        'b.descriptionCc',
        'b.costCenter',
        'b.accountOhada',
        'b.texteLibelle',
        'b.totalBudgetUsd'
      ])
      .getMany();
  }

  /** 5) Retourner tout avec transactions mais seulement certains champs du Budget */
  async findAllWithTransactions(): Promise<any[]> {
    return this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.transactions', 't')
      .select([
        'b.id',
        'b.descriptionCc',
        'b.costCenter',
        'b.accountOhada',
        'b.texteLibelle',
        'b.totalBudgetUsd',
        't.id',
        't.montant', // adapte selon tes champs
        't.date', // adapte selon tes champs
      ])
      .getMany();
  }

  /** 6) Regrouper par département avec les transactions */
  async findAllGroupedByDepartment(): Promise<any[]> {
    const qb = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.transactions', 't')
      .leftJoinAndSelect('b.department', 'd')
      .select([
        'd.id',
        'd.name',
        'b.id',
        'b.descriptionCc',
        'b.costCenter',
        'b.accountOhada',
        'b.texteLibelle',
        'b.totalBudgetUsd',
        't.id',
        't.montant',
        't.date'
      ])
      .orderBy('d.name', 'ASC');

    const budgets = await qb.getMany();

    // Regrouper par département
    const grouped = budgets.reduce((acc, budget) => {
      const depId = budget.department?.id || 0;
      if (!acc[depId]) {
        acc[depId] = {
          departmentId: depId,
          departmentName: budget.department?.name || 'Non défini',
          budgets: []
        };
      }
      acc[depId].budgets.push(budget);
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }

  /** 7) Regrouper par département et calculer montant consommé / reste à consommer */
  async findAllWithConsumption(): Promise<any[]> {
    const qb = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.transactions', 't')
      .leftJoinAndSelect('b.department', 'd')
      .select([
        'd.id',
        'd.name',
        'b.id',
        'b.descriptionCc',
        'b.costCenter',
        'b.accountOhada',
        'b.texteLibelle',
        'b.totalBudgetUsd',
        't.id',
        't.montant',
      ]);

    const budgets = await qb.getMany();

    // Regrouper par département et calculer montants
    const grouped = budgets.reduce((acc, budget) => {
      const depId = budget.department?.id || 0;
      if (!acc[depId]) {
        acc[depId] = {
          departmentId: depId,
          departmentName: budget.department?.name || 'Non défini',
          budgets: []
        };
      }

      const montantConsomme = budget.transactions?.reduce((sum, t) => sum + Number(t.depense || 0), 0) || 0;
      const resteAConsommer = Number(budget.totalBudgetUsd || 0) - montantConsomme;

      acc[depId].budgets.push({
        ...budget,
        montantConsomme,
        resteAConsommer
      });

      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }

  async getBudgetSummaryByCostCenter(costCenter: string) {
  // Récupère tous les budgets correspondant au costCenter avec leurs transactions
  const budgets = await this.repo.find({
    where: { costCenter },
    relations: ['transactions'],
  });

  if (!budgets || budgets.length === 0) {
    throw new Error(`Aucun budget trouvé pour le costCenter: ${costCenter}`);
  }

  // Calcul des totaux
  const totalBudgetUsd = budgets.reduce(
    (sum, b) => sum + Number(b.totalBudgetUsd || 0),
    0
  );

  const budgetDepense = budgets.reduce(
    (sum, b) => sum + (b.transactions?.reduce((tSum, t) => tSum + Number(t.depense || 0), 0) || 0),
    0
  );

  const budgetRestant = totalBudgetUsd - budgetDepense;

  return {
    costCenter,
    totalBudgetUsd,
    budgetDepense,
    budgetRestant,
  };
}

}
