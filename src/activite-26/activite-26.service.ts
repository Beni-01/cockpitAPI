import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateActivite26Dto } from './dto/create-activite-26.dto';
import { UpdateActivite26Dto } from './dto/update-activite-26.dto';
import { Activite26 } from './entities/activite-26.entity';

@Injectable()
export class Activite26Service {
  constructor(
    @InjectRepository(Activite26)
    private readonly activiteRepository: Repository<Activite26>,
  ) {}

  /*
  ==========================
  1. CRUD
  ==========================
  */

  async create(dto: CreateActivite26Dto): Promise<Activite26> {
    const entity = this.activiteRepository.create(dto);
    return this.activiteRepository.save(entity);
  }

  async bulkCreate(dtos: CreateActivite26Dto[]): Promise<Activite26[]> {
    const entities = this.activiteRepository.create(dtos);
    return this.activiteRepository.save(entities);
  }

  async findAll(): Promise<Activite26[]> {
    return this.activiteRepository.find();
  }

  async findOne(id: number): Promise<Activite26> {
    const entity = await this.activiteRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Activite26 #${id} not found`);
    return entity;
  }

  async update(id: number, dto: UpdateActivite26Dto): Promise<Activite26> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.activiteRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.activiteRepository.remove(entity);
  }

  /*
  ==========================
  2. FILTRE PAR TOUS LES CHAMPS
  ==========================
  */

  async filterAll(filters: any): Promise<Activite26[]> {
    const qb = this.activiteRepository.createQueryBuilder('a');

    const allowedFilters = [
      'direction',
      'objectif',
      'activite',
      'status',
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'budget',
      'observation',
      'createdAt',
      'updatedAt',
    ];

    Object.keys(filters).forEach((key) => {
      if (allowedFilters.includes(key) && filters[key] !== undefined) {
        qb.andWhere(`a.${key} = :${key}`, { [key]: filters[key] });
      }
    });

    return qb.getMany();
  }

  /*
  ==========================
  3. FILTRE + PAGINATION
  ==========================
  */

  async filterAllPaginated(filters: any, page = 1, limit = 10) {
    const qb = this.activiteRepository.createQueryBuilder('a');

    const allowedFilters = [
      'direction',
      'objectif',
      'activite',
      'status',
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'budget',
      'observation',
      'observation',
      'createdAt',
      'updatedAt',
    ];

    Object.keys(filters).forEach((key) => {
      if (allowedFilters.includes(key) && filters[key] !== undefined) {
        qb.andWhere(`a.${key} = :${key}`, { [key]: filters[key] });
      }
    });

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /*
  ==========================
  4. GROUP BY DIRECTION (toutes les colonnes)
  ==========================
  */

  async groupByDirection(direction?: string) {
  const qb = this.activiteRepository
    .createQueryBuilder('a')
    .select([
      'a.id',
      'a.objectif',
      'a.activite',
      'a.status',
      'a.T1',
      'a.T2',
      'a.T3',
      'a.T4',
      'a.T5',
      'a.budget',
      'a.direction',
      'a.observation',
      'a.createdAt',
      'a.updatedAt',
    ]);

  if (direction) {
    qb.where('a.direction = :direction', { direction });
  }

  const data = await qb.getRawMany();

  // 🔥 Transformation EXACTE demandée
  const grouped = data.reduce((acc, item) => {
    const dir = item.a_direction;
    const obj = item.a_objectif;

    // 1. Trouver ou créer la direction
    let directionEntry = acc.find(d => d[dir]);
    if (!directionEntry) {
      directionEntry = { [dir]: {} };
      acc.push(directionEntry);
    }

    // 2. Trouver ou créer l'objectif
    if (!directionEntry[dir][obj]) {
      directionEntry[dir][obj] = [];
    }

    // 3. Ajouter l'activité
    directionEntry[dir][obj].push({
      id: item.a_id,
      activite: item.a_activite,
      T1: item.a_T1,
      T2: item.a_T2,
      T3: item.a_T3,
      T4: item.a_T4,
      T5: item.a_T5,
      budget: item.a_budget,
      observation: item.a_observation,
      createdAt: item.a_createdAt,
      updatedAt: item.a_updatedAt,
    });

    return acc;
  }, []);

  return grouped;
}


  async groupByDirectionPaginated(page = 1, limit = 10) {
    const qb = this.activiteRepository
      .createQueryBuilder('a')
      .select([
        'id',
        'objectif',
        'activite',
        'status',
        'T1',
        'T2',
        'T3',
        'T4',
        'budget',
        'direction',
        'observation',
        'createdAt',
        'updatedAt',
      ])
      .addSelect('COUNT(a.id) OVER (PARTITION BY a.direction)', 'totalByDirection')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /*
  ==========================
  5. GROUP BY DIRECTION + OBJECTIF (toutes les colonnes)
  ==========================
  */

async groupByDirectionAndObjectif() {
  const data = await this.activiteRepository
    .createQueryBuilder('a')
    .select([
      'a.id',
      'a.objectif',
      'a.activite',
      'a.status',
      'a.T1',
      'a.T2',
      'a.T3',
      'a.T4',
      'a.budget',
      'a.direction',
      'a.observation',
      'a.createdAt',
      'a.updatedAt',
    ])
    .addSelect(
      'COUNT(a.id) OVER (PARTITION BY a.direction, a.objectif)',
      'totalByDirectionObjectif'
    )
    .getRawMany();

  // Transformation ici 👇
  const result = data.reduce((acc, item) => {
    const direction = item.a_direction;
    const objectif = item.a_objectif;

    // 1. Initialiser direction
    if (!acc[direction]) {
      acc[direction] = {};
    }

    // 2. Initialiser objectif
    if (!acc[direction][objectif]) {
      acc[direction][objectif] = [];
    }

    // 3. Ajouter l'activité
    acc[direction][objectif].push({
      id: item.a_id,
      activite: item.a_activite,
      T1: item.a_T1,
      T2: item.a_T2,
      T3: item.a_T3,
      T4: item.a_T4,
      budget: item.a_budget,
      observation: item.a_observation,
      createdAt: item.a_createdAt,
      updatedAt: item.a_updatedAt,
      total: item.totalByDirectionObjectif,
    });

    return acc;
  }, {});

  return result;
}

async groupByDirectionAndObjectifPaginated(page = 1, limit = 10) {
  const qb = this.activiteRepository
    .createQueryBuilder('a')
    .select([
      'a.id',
      'a.objectif',
      'a.activite',
      'a.status',
      'a.T1',
      'a.T2',
      'a.T3',
      'a.T4',
      'a.budget',
      'a.direction',
      'a.observation',
      'a.createdAt',
      'a.updatedAt',
    ])
    .addSelect(
      'COUNT(a.id) OVER (PARTITION BY a.direction, a.objectif)',
      'totalByDirectionObjectif'
    )
    .skip((page - 1) * limit)
    .take(limit);

  const data = await qb.getRawMany();

  // ⚠️ total global sans pagination
  const total = await this.activiteRepository.count();

  const totalPages = Math.ceil(total / limit);

  // 🔥 Transformation (grouping)
  const grouped = data.reduce((acc, item) => {
    const direction = item.a_direction;
    const objectif = item.a_objectif;

    if (!acc[direction]) {
      acc[direction] = {};
    }

    if (!acc[direction][objectif]) {
      acc[direction][objectif] = [];
    }

    acc[direction][objectif].push({
      id: item.a_id,
      activite: item.a_activite,
      T1: item.a_T1,
      T2: item.a_T2,
      T3: item.a_T3,
      T4: item.a_T4,
      budget: item.a_budget,
      observation: item.a_observation,
      createdAt: item.a_createdAt,
      updatedAt: item.a_updatedAt,
      total: item.totalByDirectionObjectif,
    });

    return acc;
  }, {});

  return {
    data: Object.keys(grouped).map(direction => ({
      [direction]: grouped[direction],
    })),
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
}