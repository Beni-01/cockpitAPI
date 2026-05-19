import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IcmChecklist } from '../icm/entities/icm-checklist.entity';
import { IcmQuestion } from '../icm/entities/icm-question.entity';
import { Coordination } from '../coordination/entities/coordination.entity';
import { GetIcmChecklistsDto } from './dto/get-icm-checklists.dto';
import { 
  IcmChecklistsPaginatedResponse, 
  IcmChecklistDataResponse, 
  IcmChecklistTaskResponse 
} from './interfaces/icm-checklists-response.interface';
import { ChecklistStatus, ConformityLevel } from '../icm/enums';

@Injectable()
export class IcmDashboardService {
  constructor(
    @InjectRepository(IcmChecklist)
    private readonly checklistRepository: Repository<IcmChecklist>,
    @InjectRepository(IcmQuestion)
    private readonly questionRepository: Repository<IcmQuestion>,
    @InjectRepository(Coordination)
    private readonly coordinationRepository: Repository<Coordination>,
    private readonly dataSource: DataSource,
  ) {}

  async getChecklists(dto: GetIcmChecklistsDto): Promise<IcmChecklistsPaginatedResponse> {
    const { month, year, page = 1, limit = 10, coordinationId, status, search } = dto;

    // 1. Validate month and year
    if (month < 1 || month > 12) {
      throw new BadRequestException('Mois invalide. Doit être entre 1 et 12.');
    }

    try {
      // 2. Charger les questions actives ICM
      const activeQuestions = await this.questionRepository.find({
        where: { isActive: true },
        order: { order: 'ASC' },
      });

      if (!activeQuestions || activeQuestions.length === 0) {
        throw new NotFoundException('Aucune question active ICM n’est configurée.');
      }

      // 3. Charger les checklists de la période avec pagination
      const queryBuilder = this.checklistRepository.createQueryBuilder('checklist')
        .leftJoinAndSelect('checklist.coordination', 'coordination')
        .leftJoinAndSelect('checklist.responses', 'responses')
        .leftJoinAndSelect('responses.question', 'question')
        .where('checklist.month = :month', { month })
        .andWhere('checklist.year = :year', { year });

      if (coordinationId) {
        queryBuilder.andWhere('checklist.coordinationId = :coordinationId', { coordinationId });
      }

      if (status) {
        queryBuilder.andWhere('checklist.status = :status', { status });
      }

      if (search) {
        queryBuilder.andWhere('coordination.name LIKE :search', { search: `%${search}%` });
      }

      // Sorting coordinations by name ASC
      queryBuilder.orderBy('coordination.name', 'ASC');

      const total = await queryBuilder.getCount();
      const checklists = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      // 4. Transformer les données
      const data: IcmChecklistDataResponse[] = checklists.map(checklist => {
        const tasks: IcmChecklistTaskResponse[] = activeQuestions.map((q, index) => {
          const response = checklist.responses.find(r => r.questionId === q.id);
          
          if (response) {
            return {
              questionId: q.id,
              code: `T${q.order || index + 1}`,
              category: q.category,
              label: q.label,
              periodicity: q.periodicity,
              expectedProof: q.expectedProof,
              conformityLevel: this.mapConformityLevel(response.conformityLevel),
              realised: response.realised,
              score: response.scoreItem || 0,
              proof: response.proofProvided,
              comment: response.comment,
            };
          } else {
            // Gap handling (Requirement 10)
            return {
              questionId: q.id,
              code: `T${q.order || index + 1}`,
              category: q.category,
              label: q.label,
              periodicity: q.periodicity,
              expectedProof: q.expectedProof,
              conformityLevel: 'non_conforme',
              realised: false,
              score: 0,
              proof: null,
              comment: null,
            };
          }
        });

        // 5. Calculs (Requirement 9)
        const summary = {
          totalTasks: tasks.length,
          conformes: tasks.filter(t => t.conformityLevel === 'conforme').length,
          partielles: tasks.filter(t => t.conformityLevel === 'partiellement_conforme').length,
          nonConformes: tasks.filter(t => t.conformityLevel === 'non_conforme').length,
        };

        const totalScore = tasks.reduce((sum, t) => sum + t.score, 0);
        const scorePercentage = summary.totalTasks > 0 ? (totalScore / summary.totalTasks) * 100 : 0;
        
        return {
          checklistId: checklist.id,
          coordinationId: checklist.coordinationId,
          coordinationName: checklist.coordination?.nom || 'Inconnue',
          submittedAt: checklist.submittedAt ? checklist.submittedAt.toISOString().split('T')[0] : null,
          status: this.mapStatus(checklist.status),
          score: Math.round(scorePercentage),
          scoreStatus: this.getScoreStatus(scorePercentage),
          summary,
          tasks,
        };
      });

      const monthLabels = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
        'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
      ];

      return {
        period: {
          month,
          year,
          label: `${monthLabels[month - 1]} ${year}`
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching ICM checklists:', error);
      throw new InternalServerErrorException('Une erreur est survenue lors de la récupération des checklists.');
    }
  }

  private mapStatus(status: ChecklistStatus): string {
    switch (status) {
      case ChecklistStatus.BROUILLON: return 'draft';
      case ChecklistStatus.SOUMIS: return 'submitted';
      case ChecklistStatus.VALIDE: return 'validated';
      case ChecklistStatus.REJETE: return 'rejected';
      default: return 'unknown';
    }
  }

  private mapConformityLevel(level: ConformityLevel): string {
    switch (level) {
      case ConformityLevel.CONFORME: return 'conforme';
      case ConformityLevel.PARTIELLEMENT_CONFORME: return 'partiellement_conforme';
      case ConformityLevel.NON_CONFORME: return 'non_conforme';
      default: return 'non_conforme';
    }
  }

  private getScoreStatus(score: number): string {
    if (score >= 85) return 'Management Solide';
    if (score >= 70) return 'Acceptable';
    return 'Faible';
  }
}
