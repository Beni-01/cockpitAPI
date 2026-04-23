import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserActivitiesAssignment } from './entities/user-activities-assignment.entity';
import { CreateUserActivitiesAssignmentDto } from './dto/create-user-activities-assignment.dto';
import { UpdateUserActivitiesAssignmentDto } from './dto/update-user-activities-assignment.dto';

@Injectable()
export class UserActivitiesAssignmentService {
  private readonly logger = new Logger(UserActivitiesAssignmentService.name);

  constructor(
    @InjectRepository(UserActivitiesAssignment)
    private readonly assignmentRepository: Repository<UserActivitiesAssignment>,
    private readonly dataSource: DataSource,
  ) {}

  // ── CREATE ─────────────────────────────────────────────────────────────────

  async create(dto: CreateUserActivitiesAssignmentDto): Promise<UserActivitiesAssignment> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // Vérifier doublon userId + sousActivityId
        const existing = await manager.findOne(UserActivitiesAssignment, {
          where: { userId: dto.userId, sousActivityId: dto.sousActivityId },
        });

        if (existing) {
          throw new ConflictException(
            `L'utilisateur ID=${dto.userId} est déjà assigné à la sous-activité ID=${dto.sousActivityId}.`,
          );
        }

        const assignment = manager.create(UserActivitiesAssignment, dto);
        const saved = await manager.save(UserActivitiesAssignment, assignment);

        this.logger.log(
          `Assignation créée : ID=${saved.id} | User=${saved.userId} → SousActivité=${saved.sousActivityId}`,
        );
        return saved;
      } catch (error) {
        if (
          error instanceof ConflictException ||
          error instanceof BadRequestException
        )
          throw error;
        this.logger.error('Erreur create()', error?.stack);
        throw new InternalServerErrorException(
          "Impossible de créer l'assignation.",
        );
      }
    });
  }

  // ── FIND ALL ───────────────────────────────────────────────────────────────

  async findAll(
    page = 1,
    limit = 10,
    userId?: number,
    sousActivityId?: number,
  ): Promise<{ data: UserActivitiesAssignment[]; pagination: any }> {
    try {
      const pageNum = Math.max(1, page);
      const take = Math.min(100, Math.max(1, limit));
      const skip = (pageNum - 1) * take;

      const qb = this.assignmentRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.user', 'user')
        .leftJoinAndSelect('a.sousActivity', 'sousActivity')
        .orderBy('a.id', 'DESC')
        .skip(skip)
        .take(take);

      if (userId) {
        qb.andWhere('a.userId = :userId', { userId });
      }

      if (sousActivityId) {
        qb.andWhere('a.sousActivityId = :sousActivityId', { sousActivityId });
      }

      const [data, totalItems] = await qb.getManyAndCount();

      return {
        data,
        pagination: {
          page: pageNum,
          limit: take,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / take)),
        },
      };
    } catch (error) {
      this.logger.error('Erreur findAll()', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de récupérer les assignations.',
      );
    }
  }

  // ── FIND ONE ───────────────────────────────────────────────────────────────

  async findOne(id: number): Promise<UserActivitiesAssignment> {
    try {
      const assignment = await this.assignmentRepository.findOne({
        where: { id },
        relations: ['user', 'sousActivity'],
      });

      if (!assignment) {
        throw new NotFoundException(`Assignation ID=${id} introuvable.`);
      }

      return assignment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur findOne(${id})`, error?.stack);
      throw new InternalServerErrorException(
        "Impossible de récupérer l'assignation.",
      );
    }
  }

  // ── FIND BY USER ───────────────────────────────────────────────────────────

  async findByUser(userId: number): Promise<UserActivitiesAssignment[]> {
    try {
      return await this.assignmentRepository.find({
        where: { userId },
        relations: ['sousActivity'],
        order: { id: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Erreur findByUser(${userId})`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de récupérer les assignations de cet utilisateur.',
      );
    }
  }

  // ── FIND BY SOUS-ACTIVITÉ ──────────────────────────────────────────────────

  async findBySousActivity(sousActivityId: number): Promise<UserActivitiesAssignment[]> {
    try {
      return await this.assignmentRepository.find({
        where: { sousActivityId },
        relations: ['user'],
        order: { id: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Erreur findBySousActivity(${sousActivityId})`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de récupérer les assignations de cette sous-activité.',
      );
    }
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────

  async update(
    id: number,
    dto: UpdateUserActivitiesAssignmentDto,
  ): Promise<UserActivitiesAssignment> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const assignment = await manager.findOne(UserActivitiesAssignment, {
          where: { id },
        });

        if (!assignment) {
          throw new NotFoundException(`Assignation ID=${id} introuvable.`);
        }

        // Vérifier doublon si userId ou sousActivityId changent
        const newUserId = dto.userId ?? assignment.userId;
        const newSousActivityId = dto.sousActivityId ?? assignment.sousActivityId;

        if (
          newUserId !== assignment.userId ||
          newSousActivityId !== assignment.sousActivityId
        ) {
          const conflict = await manager.findOne(UserActivitiesAssignment, {
            where: { userId: newUserId, sousActivityId: newSousActivityId },
          });
          if (conflict && conflict.id !== id) {
            throw new ConflictException(
              `L'utilisateur ID=${newUserId} est déjà assigné à la sous-activité ID=${newSousActivityId}.`,
            );
          }
        }

        const updated = manager.merge(UserActivitiesAssignment, assignment, dto);
        const saved = await manager.save(UserActivitiesAssignment, updated);

        this.logger.log(`Assignation mise à jour : ID=${saved.id}`);
        return saved;
      } catch (error) {
        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException
        )
          throw error;
        this.logger.error(`Erreur update(${id})`, error?.stack);
        throw new InternalServerErrorException(
          "Impossible de mettre à jour l'assignation.",
        );
      }
    });
  }

  // ── SOFT DELETE ─────────────────────────────────────────────────────────────

  async remove(id: number): Promise<{ message: string }> {
    try {
      const assignment = await this.assignmentRepository.findOne({
        where: { id },
      });

      if (!assignment) {
        throw new NotFoundException(`Assignation ID=${id} introuvable.`);
      }

      await this.assignmentRepository.softDelete(id);
      this.logger.log(`Assignation supprimée (soft) : ID=${id}`);
      return { message: `Assignation ID=${id} supprimée avec succès.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur remove(${id})`, error?.stack);
      throw new InternalServerErrorException(
        "Impossible de supprimer l'assignation.",
      );
    }
  }

  // ── SUPPRIMER PAR userId + sousActivityId ─────────────────────────────────

  async removeByPair(userId: number, sousActivityId: number): Promise<{ message: string }> {
    try {
      const assignment = await this.assignmentRepository.findOne({
        where: { userId, sousActivityId },
      });

      if (!assignment) {
        throw new NotFoundException(
          `Aucune assignation trouvée pour User=${userId} et SousActivité=${sousActivityId}.`,
        );
      }

      await this.assignmentRepository.softDelete(assignment.id);
      this.logger.log(`Assignation supprimée : User=${userId} ↔ SousActivité=${sousActivityId}`);
      return { message: `Assignation supprimée avec succès.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur removeByPair(${userId}, ${sousActivityId})`, error?.stack);
      throw new InternalServerErrorException(
        "Impossible de supprimer l'assignation.",
      );
    }
  }
}
