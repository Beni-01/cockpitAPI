import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IcmChecklist } from '../entities/icm-checklist.entity';
import { IcmChecklistResponse } from '../entities/icm-checklist-response.entity';
import { IcmQuestion } from '../entities/icm-question.entity';
import {
  InitIcmChecklistDto,
  UpdateIcmChecklistResponsesDto,
  FilterIcmChecklistDto,
  ValidateIcmChecklistDto,
  RejectIcmChecklistDto,
} from '../dto';
import { ChecklistStatus, ConformityLevel } from '../enums';
import { IcmQuestionService } from './icm-question.service';

@Injectable()
export class IcmChecklistService {
  constructor(
    @InjectRepository(IcmChecklist)
    private readonly icmChecklistRepository: Repository<IcmChecklist>,
    @InjectRepository(IcmChecklistResponse)
    private readonly icmChecklistResponseRepository: Repository<IcmChecklistResponse>,
    @InjectRepository(IcmQuestion)
    private readonly icmQuestionRepository: Repository<IcmQuestion>,
    private readonly icmQuestionService: IcmQuestionService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Initialiser une nouvelle checklist ICM
   * Vérifie les doublons et crée automatiquement les réponses
   */
  async initChecklist(
    initDto: InitIcmChecklistDto,
    userId: number,
  ): Promise<IcmChecklist> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Vérifier si une checklist existe déjà pour cette période
      const existingChecklist = await queryRunner.manager.findOne(IcmChecklist, {
        where: {
          coordinationId: initDto.coordinationId,
          month: initDto.month,
          year: initDto.year,
          deletedAt: null,
        },
      });

      if (existingChecklist) {
        throw new ConflictException(
          `Une checklist existe déjà pour cette coordination et cette période (${initDto.month}/${initDto.year}).`,
        );
      }

      // Créer la checklist
      const checklist = queryRunner.manager.create(IcmChecklist, {
        coordinationId: initDto.coordinationId,
        month: initDto.month,
        year: initDto.year,
        status: ChecklistStatus.BROUILLON,
        createdBy: userId,
      });

      const savedChecklist = await queryRunner.manager.save(checklist);

      // Récupérer les questions actives
      const activeQuestions = await queryRunner.manager.find(IcmQuestion, {
        where: { isActive: true, deletedAt: null },
        order: { order: 'ASC' },
      });

      if (activeQuestions.length === 0) {
        throw new BadRequestException(
          'Aucune question ICM active disponible. Veuillez d\'abord configurer les questions.',
        );
      }

      // Générer les réponses automatiquement
      const responses = activeQuestions.map((question) =>
        queryRunner.manager.create(IcmChecklistResponse, {
          checklistId: savedChecklist.id,
          questionId: question.id,
          realised: false,
          conformityLevel: null,
          scoreItem: 0,
        }),
      );

      await queryRunner.manager.save(responses);
      await queryRunner.commitTransaction();

      // Récupérer la checklist complète avec les réponses
      return await this.findOne(savedChecklist.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de l'initialisation de la checklist: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Récupérer une checklist par ID avec ses réponses
   */
  async findOne(id: number): Promise<IcmChecklist> {
    try {
      const checklist = await this.icmChecklistRepository.findOne({
        where: { id, deletedAt: null },
        relations: ['responses', 'responses.question', 'coordination', 'creator', 'validator'],
      });

      if (!checklist) {
        throw new NotFoundException(`Checklist ICM avec l'ID ${id} non trouvée`);
      }

      return checklist;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la récupération de la checklist: ${error.message}`,
      );
    }
  }

  /**
   * Lister les checklists avec filtres et pagination
   */
  async findAll(filterDto: FilterIcmChecklistDto) {
    try {
      const { coordinationId, month, year, status, page = 1, limit = 10 } = filterDto;

      let query = this.icmChecklistRepository
        .createQueryBuilder('checklist')
        .leftJoinAndSelect('checklist.responses', 'responses')
        .leftJoinAndSelect('responses.question', 'question')
        .leftJoinAndSelect('checklist.coordination', 'coordination')
        .leftJoinAndSelect('checklist.creator', 'creator')
        .where('checklist.deletedAt IS NULL');

      if (coordinationId) {
        query = query.andWhere('checklist.coordinationId = :coordinationId', {
          coordinationId,
        });
      }

      if (month) {
        query = query.andWhere('checklist.month = :month', { month });
      }

      if (year) {
        query = query.andWhere('checklist.year = :year', { year });
      }

      if (status) {
        query = query.andWhere('checklist.status = :status', { status });
      }

      const total = await query.getCount();

      const checklists = await query
        .orderBy('checklist.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        data: checklists,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des checklists: ${error.message}`,
      );
    }
  }

  /**
   * Mettre à jour les réponses d'une checklist
   */
  async updateResponses(
    checklistId: number,
    updateDto: UpdateIcmChecklistResponsesDto,
  ): Promise<IcmChecklist> {
    try {
      const checklist = await this.findOne(checklistId);

      // Vérifier que la checklist est encore en brouillon
      if (checklist.status !== ChecklistStatus.BROUILLON) {
        throw new BadRequestException(
          'Seules les checklists en brouillon peuvent être modifiées.',
        );
      }

      // Mettre à jour chaque réponse
      for (const updateResponse of updateDto.responses) {
        const response = await this.icmChecklistResponseRepository.findOne({
          where: { id: updateResponse.id, checklistId },
        });

        if (!response) {
          throw new NotFoundException(
            `Réponse avec l'ID ${updateResponse.id} non trouvée dans cette checklist`,
          );
        }

        // Mettre à jour les champs
        if (updateResponse.realised !== undefined) {
          response.realised = updateResponse.realised;
        }

        if (updateResponse.conformityLevel !== undefined) {
          response.conformityLevel = updateResponse.conformityLevel;
        }

        if (updateResponse.comment !== undefined) {
          response.comment = updateResponse.comment;
        }

        if (updateResponse.proofProvided !== undefined) {
          response.proofProvided = updateResponse.proofProvided;
        }

        // Calculer le score de l'item
        response.scoreItem = this.calculateItemScore(
          response.realised,
          response.conformityLevel,
        );

        await this.icmChecklistResponseRepository.save(response);
      }

      return await this.findOne(checklistId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour des réponses: ${error.message}`,
      );
    }
  }

  /**
   * Calculer le score ICM pour une checklist
   */
  private calculateICMScore(checklist: IcmChecklist): number {
    if (!checklist.responses || checklist.responses.length === 0) {
      return 0;
    }

    const totalScore = checklist.responses.reduce(
      (sum, response) => sum + (response.scoreItem || 0),
      0,
    );

    const score = (totalScore / checklist.responses.length) * 100;
    return Math.round(score * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Calculer le score d'un item en fonction de sa réalisation et conformité
   */
  private calculateItemScore(realised: boolean, conformityLevel: ConformityLevel): number {
    if (!realised) {
      return 0;
    }

    if (!conformityLevel) {
      return 0;
    }

    switch (conformityLevel) {
      case ConformityLevel.CONFORME:
        return 1;
      case ConformityLevel.PARTIELLEMENT_CONFORME:
        return 0.5;
      case ConformityLevel.NON_CONFORME:
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Soumettre une checklist
   */
  async submitChecklist(checklistId: number): Promise<IcmChecklist> {
    try {
      const checklist = await this.findOne(checklistId);

      // Vérifier le statut actuel
      if (checklist.status !== ChecklistStatus.BROUILLON) {
        throw new BadRequestException(
          'Seules les checklists en brouillon peuvent être soumises.',
        );
      }

      // Vérifier que toutes les réponses ont au moins un niveau de conformité
      const incompleteResponses = checklist.responses.filter(
        (response) => response.realised && !response.conformityLevel,
      );

      if (incompleteResponses.length > 0) {
        throw new BadRequestException(
          `${incompleteResponses.length} tâche(s) réalisée(s) n'ont pas de niveau de conformité défini.`,
        );
      }

      // Calculer le score ICM
      checklist.status = ChecklistStatus.SOUMIS;
      checklist.submittedAt = new Date();
      checklist.scoreICM = this.calculateICMScore(checklist);

      return await this.icmChecklistRepository.save(checklist);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la soumission de la checklist: ${error.message}`,
      );
    }
  }

  /**
   * Valider une checklist
   */
  async validateChecklist(
    validateDto: ValidateIcmChecklistDto,
    validatorId: number,
  ): Promise<IcmChecklist> {
    try {
      const checklist = await this.findOne(validateDto.checklistId);

      // Vérifier le statut
      if (checklist.status !== ChecklistStatus.SOUMIS) {
        throw new BadRequestException(
          'Seules les checklists soumises peuvent être validées.',
        );
      }

      checklist.status = ChecklistStatus.VALIDE;
      checklist.validatedBy = validatorId;
      checklist.validatedAt = new Date();

      return await this.icmChecklistRepository.save(checklist);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la validation de la checklist: ${error.message}`,
      );
    }
  }

  /**
   * Rejeter une checklist
   */
  async rejectChecklist(
    rejectDto: RejectIcmChecklistDto,
    validatorId: number,
  ): Promise<IcmChecklist> {
    try {
      const checklist = await this.findOne(rejectDto.checklistId);

      // Vérifier le statut
      if (checklist.status !== ChecklistStatus.SOUMIS) {
        throw new BadRequestException(
          'Seules les checklists soumises peuvent être rejetées.',
        );
      }

      checklist.status = ChecklistStatus.REJETE;
      checklist.rejectionReason = rejectDto.rejectionReason;
      checklist.validatedBy = validatorId;
      checklist.validatedAt = new Date();

      return await this.icmChecklistRepository.save(checklist);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors du rejet de la checklist: ${error.message}`,
      );
    }
  }

  /**
   * Supprimer (soft delete) une checklist
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      const checklist = await this.findOne(id);

      // Seules les checklists en brouillon peuvent être supprimées
      if (checklist.status !== ChecklistStatus.BROUILLON) {
        throw new BadRequestException(
          'Seules les checklists en brouillon peuvent être supprimées.',
        );
      }

      await this.icmChecklistRepository.softRemove(checklist);
      return { message: 'Checklist ICM supprimée avec succès' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la suppression de la checklist: ${error.message}`,
      );
    }
  }
}
