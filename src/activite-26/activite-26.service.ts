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

  async groupByDirection() {
    return this.activiteRepository
      .createQueryBuilder('a')
      .select([
        'a.id',
        'a.objectif',
        'a.activite',
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
      ])
      .addSelect('COUNT(a.id) OVER (PARTITION BY a.direction)', 'totalByDirection')
      .getRawMany();
  }

  async groupByDirectionPaginated(page = 1, limit = 10) {
    const qb = this.activiteRepository
      .createQueryBuilder('a')
      .select([
        'a.id',
        'a.objectif',
        'a.activite',
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
    return this.activiteRepository
      .createQueryBuilder('a')
      .select([
        'a.id',
        'a.objectif',
        'a.activite',
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
      ])
      .addSelect('COUNT(a.id) OVER (PARTITION BY a.direction, a.objectif)', 'totalByDirectionObjectif')
      .getRawMany();
  }

  async groupByDirectionAndObjectifPaginated(page = 1, limit = 10) {
    const qb = this.activiteRepository
      .createQueryBuilder('a')
      .select([
        'a.id',
        'a.objectif',
        'a.activite',
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
      ])
      .addSelect('COUNT(a.id) OVER (PARTITION BY a.direction, a.objectif)', 'totalByDirectionObjectif')
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
}