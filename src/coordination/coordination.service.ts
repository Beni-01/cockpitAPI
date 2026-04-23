import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Coordination, CoordinationType, CoordinationStatus } from './entities/coordination.entity';
import { CreateCoordinationDto } from './dto/create-coordination.dto';
import { UpdateCoordinationDto } from './dto/update-coordination.dto';

@Injectable()
export class CoordinationService {
  private readonly logger = new Logger(CoordinationService.name);

  constructor(
    @InjectRepository(Coordination)
    private readonly coordinationRepository: Repository<Coordination>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCoordinationDto): Promise<Coordination> {
    try {
      const coordination = this.coordinationRepository.create(dto);
      return await this.coordinationRepository.save(coordination);
    } catch (error) {
      this.logger.error('Erreur create coordination', error?.stack);
      throw new InternalServerErrorException('Impossible de créer la coordination.');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    type?: CoordinationType,
  ): Promise<{ data: Coordination[]; total: number }> {
    try {
      const query = this.coordinationRepository
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.antennes', 'antennes')
        .orderBy('c.nom', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        query.andWhere(
          '(c.nom LIKE :search OR c.province LIKE :search OR c.coordonnateurNom LIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (type) {
        query.andWhere('c.type = :type', { type });
      }

      const [data, total] = await query.getManyAndCount();
      return { data, total };
    } catch (error) {
      this.logger.error('Erreur findAll coordination', error?.stack);
      throw new InternalServerErrorException('Impossible de récupérer les coordinations.');
    }
  }

  async findOne(id: number): Promise<Coordination> {
    const coordination = await this.coordinationRepository.findOne({
      where: { id },
      relations: ['antennes'],
    });
    if (!coordination) {
      throw new NotFoundException(`Coordination ID=${id} non trouvée.`);
    }
    return coordination;
  }

  async update(id: number, dto: UpdateCoordinationDto): Promise<Coordination> {
    const coordination = await this.findOne(id);
    Object.assign(coordination, dto);
    return await this.coordinationRepository.save(coordination);
  }

  async remove(id: number): Promise<void> {
    const coordination = await this.findOne(id);
    await this.coordinationRepository.softRemove(coordination);
  }

  async getSummary() {
    try {
      const total = await this.coordinationRepository.count();
      const recouvrement = await this.coordinationRepository.count({
        where: { type: CoordinationType.RECOUVREMENT },
      });
      const administratives = await this.coordinationRepository.count({
        where: { type: CoordinationType.ADMINISTRATIVE },
      });

      const agentsRes = await this.coordinationRepository
        .createQueryBuilder('c')
        .select('SUM(c.effectifActuel)', 'totalAgents')
        .getRawOne();

      return {
        total,
        recouvrement,
        administratives,
        agentsActifs: Number(agentsRes.totalAgents || 0),
      };
    } catch (error) {
      this.logger.error('Erreur getSummary coordination', error?.stack);
      throw new InternalServerErrorException('Impossible de générer le résumé.');
    }
  }
}
