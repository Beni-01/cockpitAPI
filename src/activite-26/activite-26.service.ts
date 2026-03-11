import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
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
  1. CRUD COMPLET
  ==========================
  */

  async create(dto: CreateActivite26Dto): Promise<Activite26> {
    try {
      const activite = this.activiteRepository.create(dto);
      return await this.activiteRepository.save(activite);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création');
    }
  }

   /**
   * BULK CREATE
   * @param dtos Tableau de CreateActivite26Dto
   */
  async bulkCreate(dtos: CreateActivite26Dto[]): Promise<Activite26[]> {
    try {
      // Transforme chaque DTO en entité
      const activites = this.activiteRepository.create(dtos);

      // Sauvegarde toutes les entités en une seule opération
      return await this.activiteRepository.save(activites);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Erreur lors de la création en masse des activités',
      );
    }
  }

  async findAll(): Promise<Activite26[]> {
    return this.activiteRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Activite26> {
    const activite = await this.activiteRepository.findOne({
      where: { id },
    });

    if (!activite) {
      throw new NotFoundException(`Activité ${id} introuvable`);
    }

    return activite;
  }

  async update(id: number, dto: UpdateActivite26Dto): Promise<Activite26> {
    const activite = await this.findOne(id);

    Object.assign(activite, dto);

    return this.activiteRepository.save(activite);
  }

  async remove(id: number): Promise<void> {
    const activite = await this.findOne(id);

    await this.activiteRepository.remove(activite);
  }

  /*
  ==========================
  2. FILTRE PAR TOUS LES CHAMPS
  ==========================
  */

  async filterAll(filters: any): Promise<Activite26[]> {
    const qb = this.activiteRepository.createQueryBuilder('a');

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined) {
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

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined) {
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
  4. GROUPE PAR DIRECTION
  ==========================
  */

  async groupByDirection() {
    return this.activiteRepository
      .createQueryBuilder('a')
      .select('a.direction', 'direction')
      .addSelect('COUNT(a.id)', 'total')
      .groupBy('a.direction')
      .getRawMany();
  }

  /*
  ==========================
  5. GROUPE PAR DIRECTION + PAGINATION
  ==========================
  */

  async groupByDirectionPaginated(page = 1, limit = 10) {
    const qb = this.activiteRepository
      .createQueryBuilder('a')
      .select('a.direction', 'direction')
      .addSelect('COUNT(a.id)', 'total')
      .groupBy('a.direction');

    qb.skip((page - 1) * limit).take(limit);

    const data = await qb.getRawMany();

    const total = data.length;

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /*
  ==========================
  6. GROUPE PAR DIRECTION + OBJECTIF
  ==========================
  */

  async groupByDirectionAndObjectif() {
    return this.activiteRepository
      .createQueryBuilder('a')
      .select('a.direction', 'direction')
      .addSelect('a.objectif', 'objectif')
      .addSelect('COUNT(a.id)', 'total')
      .groupBy('a.direction')
      .addGroupBy('a.objectif')
      .getRawMany();
  }

  /*
  ==========================
  7. GROUPE PAR DIRECTION + OBJECTIF + PAGINATION
  ==========================
  */

  async groupByDirectionAndObjectifPaginated(page = 1, limit = 10) {
    const qb = this.activiteRepository
      .createQueryBuilder('a')
      .select('a.direction', 'direction')
      .addSelect('a.objectif', 'objectif')
      .addSelect('COUNT(a.id)', 'total')
      .groupBy('a.direction')
      .addGroupBy('a.objectif');

    qb.skip((page - 1) * limit).take(limit);

    const data = await qb.getRawMany();

    const total = data.length;

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}