import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Antenne, AntenneStatus } from './entities/antenne.entity';
import { CreateAntenneDto } from './dto/create-antenne.dto';
import { UpdateAntenneDto } from './dto/update-antenne.dto';

@Injectable()
export class AntenneService {
  private readonly logger = new Logger(AntenneService.name);

  constructor(
    @InjectRepository(Antenne)
    private readonly antenneRepository: Repository<Antenne>,
  ) {}

  async create(dto: CreateAntenneDto): Promise<Antenne> {
    try {
      const antenne = this.antenneRepository.create(dto);
      return await this.antenneRepository.save(antenne);
    } catch (error) {
      this.logger.error('Erreur create antenne', error?.stack);
      throw new InternalServerErrorException('Impossible de créer l\'antenne.');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: AntenneStatus,
    coordinationId?: number,
  ): Promise<{ data: Antenne[]; total: number }> {
    try {
      const query = this.antenneRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.coordination', 'coordination')
        .orderBy('a.nom', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        query.andWhere(
          '(a.nom LIKE :search OR a.code LIKE :search OR a.responsable LIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (status) {
        query.andWhere('a.status = :status', { status });
      }

      if (coordinationId) {
        query.andWhere('a.coordinationId = :coordinationId', { coordinationId });
      }

      const [data, total] = await query.getManyAndCount();
      return { data, total };
    } catch (error) {
      this.logger.error('Erreur findAll antenne', error?.stack);
      throw new InternalServerErrorException('Impossible de récupérer les antennes.');
    }
  }

  async findOne(id: number): Promise<Antenne> {
    const antenne = await this.antenneRepository.findOne({
      where: { id },
      relations: ['coordination'],
    });
    if (!antenne) {
      throw new NotFoundException(`Antenne ID=${id} non trouvée.`);
    }
    return antenne;
  }

  async update(id: number, dto: UpdateAntenneDto): Promise<Antenne> {
    const antenne = await this.findOne(id);
    Object.assign(antenne, dto);
    return await this.antenneRepository.save(antenne);
  }

  async remove(id: number): Promise<void> {
    const antenne = await this.findOne(id);
    await this.antenneRepository.softRemove(antenne);
  }

  async getSummary() {
    try {
      const total = await this.antenneRepository.count();
      const actives = await this.antenneRepository.count({
        where: { status: AntenneStatus.ACTIVE },
      });
      const inactives = await this.antenneRepository.count({
        where: { status: AntenneStatus.INACTIVE },
      });

      const agentsRes = await this.antenneRepository
        .createQueryBuilder('a')
        .select('SUM(a.nombreAgents)', 'totalAgents')
        .getRawOne();

      const coordCountRes = await this.antenneRepository
        .createQueryBuilder('a')
        .select('COUNT(DISTINCT a.coordinationId)', 'count')
        .getRawOne();

      return {
        total,
        actives,
        inactives,
        agentsAssignes: Number(agentsRes.totalAgents || 0),
        coordinationsCouvertes: Number(coordCountRes.count || 0),
      };
    } catch (error) {
      this.logger.error('Erreur getSummary antenne', error?.stack);
      throw new InternalServerErrorException('Impossible de générer le résumé.');
    }
  }
}
