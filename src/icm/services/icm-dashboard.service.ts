import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IcmChecklist } from '../entities/icm-checklist.entity';
import { IcmChecklistResponse } from '../entities/icm-checklist-response.entity';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { ChecklistStatus, ConformityLevel } from '../enums';
import {
  IcmDashboardSummaryResponseDto,
  IcmDashboardChecklistsResponseDto,
  IcmDashboardConsolidatedResponseDto,
  CoordinationScoreRowDto,
  NationalScoreRowDto,
  StatisticsDto,
  PeriodDto,
  IcmChecklistItemDto,
  ConsolidatedChecklistItemDto,
} from '../dto/icm-dashboard-summary.dto';

@Injectable()
export class IcmDashboardService {
  constructor(
    @InjectRepository(IcmChecklist)
    private readonly checklistRepository: Repository<IcmChecklist>,
    @InjectRepository(IcmChecklistResponse)
    private readonly responseRepository: Repository<IcmChecklistResponse>,
    @InjectRepository(Coordination)
    private readonly coordinationRepository: Repository<Coordination>,
  ) {}

  /**
   * Récupère le score d'une checklist basé sur ses réponses
   */
  private calculateScore(totalTasks: number, conformes: number, partielles: number): number {
    if (totalTasks === 0) return 0;
    return Math.round(((conformes + partielles * 0.5) / totalTasks) * 100);
  }

  /**
   * Détermine le statut basé sur le score
   */
  private getStatus(score: number): string {
    if (score >= 85) return 'Management Solide';
    if (score >= 70) return 'Acceptable';
    return 'Faible';
  }

  /**
   * Formate la date au format Mois Année (ex: Avr 2026)
   */
  private formatPeriod(month: number, year: number): string {
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
    ];
    return `${monthNames[month - 1]} ${year}`;
  }

  /**
   * Récupère le résumé du dashboard ICM (synthèse nationale + scores par coordination)
   */
  async getSummary(month: number, year: number): Promise<IcmDashboardSummaryResponseDto> {
    if (!month || !year) {
      throw new BadRequestException('Les paramètres month et year sont requis');
    }

    try {
      // Récupérer toutes les checklists validées pour la période
      const checklists = await this.checklistRepository
        .createQueryBuilder('checklist')
        .leftJoinAndSelect('checklist.coordination', 'coordination')
        .leftJoinAndSelect('checklist.responses', 'responses')
        .leftJoinAndSelect('responses.question', 'question')
        .where('checklist.month = :month', { month })
        .andWhere('checklist.year = :year', { year })
        .andWhere('checklist.status = :status', { status: ChecklistStatus.VALIDE })
        .orderBy('coordination.nom', 'ASC')
        .getMany();

      const coordinationScores = new Map<number, any>();
      let totalNationalTasks = 0;
      let totalNationalConformes = 0;
      let totalNationalPartielles = 0;
      let totalNationalNonConformes = 0;

      // Traiter chaque checklist
      for (const checklist of checklists) {
        const coordinationId = checklist.coordinationId;

        if (!coordinationScores.has(coordinationId)) {
          coordinationScores.set(coordinationId, {
            coordinationId,
            coordinationName: checklist.coordination.nom,
            totalTasks: 0,
            conformes: 0,
            partielles: 0,
            nonConformes: 0,
          });
        }

        const coordData = coordinationScores.get(coordinationId);

        // Compter les réponses
        if (checklist.responses && checklist.responses.length > 0) {
          for (const response of checklist.responses) {
            coordData.totalTasks++;

            if (response.conformityLevel === ConformityLevel.CONFORME) {
              coordData.conformes++;
            } else if (response.conformityLevel === ConformityLevel.PARTIELLEMENT_CONFORME) {
              coordData.partielles++;
            } else if (response.conformityLevel === ConformityLevel.NON_CONFORME) {
              coordData.nonConformes++;
            }
          }
        }
      }

      // Calculer les scores par coordination et les totaux nationaux
      const rows: CoordinationScoreRowDto[] = [];
      coordinationScores.forEach((coordData) => {
        const score = this.calculateScore(coordData.totalTasks, coordData.conformes, coordData.partielles);
        const status = this.getStatus(score);

        rows.push({
          coordinationId: coordData.coordinationId,
          coordinationName: coordData.coordinationName,
          totalTasks: coordData.totalTasks,
          conformes: coordData.conformes,
          partielles: coordData.partielles,
          nonConformes: coordData.nonConformes,
          score,
          status,
        });

        // Accumuler pour les totaux nationaux
        totalNationalTasks += coordData.totalTasks;
        totalNationalConformes += coordData.conformes;
        totalNationalPartielles += coordData.partielles;
        totalNationalNonConformes += coordData.nonConformes;
      });

      // Calculer le score et statut national
      const nationalScore = this.calculateScore(totalNationalTasks, totalNationalConformes, totalNationalPartielles);
      const nationalStatus = this.getStatus(nationalScore);

      // Compter les statuts
      const stats: StatisticsDto = {
        managementSolide: rows.filter((r) => r.status === 'Management Solide').length,
        acceptable: rows.filter((r) => r.status === 'Acceptable').length,
        faible: rows.filter((r) => r.status === 'Faible').length,
      };

      // Construire la réponse
      return {
        period: {
          month,
          year,
          label: this.formatPeriod(month, year),
        },
        nationalScore,
        nationalStatus,
        stats,
        rows,
        nationalRow: {
          label: 'Score national',
          totalTasks: totalNationalTasks,
          conformes: totalNationalConformes,
          partielles: totalNationalPartielles,
          nonConformes: totalNationalNonConformes,
          score: nationalScore,
          status: nationalStatus,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Erreur lors du calcul du résumé ICM:', error);
      throw new InternalServerErrorException('Erreur lors de la récupération du résumé du dashboard ICM');
    }
  }

  /**
   * Récupère le consolidé détaillé des réponses
   */
  async getConsolidated(month: number, year: number): Promise<IcmDashboardConsolidatedResponseDto> {
    if (!month || !year) {
      throw new BadRequestException('Les paramètres month et year sont requis');
    }

    try {
      const responses = await this.responseRepository
        .createQueryBuilder('response')
        .leftJoinAndSelect('response.checklist', 'checklist')
        .leftJoinAndSelect('checklist.coordination', 'coordination')
        .leftJoinAndSelect('response.question', 'question')
        .where('checklist.month = :month', { month })
        .andWhere('checklist.year = :year', { year })
        .andWhere('checklist.status = :status', { status: ChecklistStatus.VALIDE })
        .orderBy('coordination.nom', 'ASC')
        .addOrderBy('question.category', 'ASC')
        .addOrderBy('question.order', 'ASC')
        .getMany();

      const data: ConsolidatedChecklistItemDto[] = responses.map((response) => ({
        coordinationName: response.checklist.coordination.nom,
        category: response.question.category,
        question: response.question.label,
        conformityLevel: response.conformityLevel || 'Non spécifié',
        scoreItem: response.scoreItem || 0,
        proofProvided: response.proofProvided || '-',
        comment: response.comment || '-',
      }));

      return {
        period: {
          month,
          year,
          label: this.formatPeriod(month, year),
        },
        data,
        total: data.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Erreur lors du calcul du consolidé ICM:', error);
      throw new InternalServerErrorException('Erreur lors de la récupération du consolidé du dashboard ICM');
    }
  }

  /**
   * Récupère la liste des checklists
   */
  async getChecklists(month: number, year: number): Promise<IcmDashboardChecklistsResponseDto> {
    if (!month || !year) {
      throw new BadRequestException('Les paramètres month et year sont requis');
    }

    try {
      const checklists = await this.checklistRepository
        .createQueryBuilder('checklist')
        .leftJoinAndSelect('checklist.coordination', 'coordination')
        .leftJoinAndSelect('checklist.creator', 'creator')
        .leftJoinAndSelect('checklist.validator', 'validator')
        .where('checklist.month = :month', { month })
        .andWhere('checklist.year = :year', { year })
        .orderBy('checklist.createdAt', 'DESC')
        .getMany();

      const checklistItems: IcmChecklistItemDto[] = checklists.map((checklist) => ({
        checklistId: checklist.id,
        coordinationName: checklist.coordination.nom,
        month: checklist.month,
        year: checklist.year,
        status: checklist.status,
        scoreICM: checklist.scoreICM || 0,
        createdBy: checklist.creator?.nom || 'N/A',
        createdAt: checklist.createdAt,
        validationStatus:
          checklist.status === ChecklistStatus.VALIDE
            ? `Validé par ${checklist.validator?.nom || 'N/A'}`
            : checklist.status === ChecklistStatus.REJETE
              ? `Rejeté: ${checklist.rejectionReason || 'N/A'}`
              : checklist.status,
      }));

      return {
        period: {
          month,
          year,
          label: this.formatPeriod(month, year),
        },
        checklists: checklistItems,
        total: checklistItems.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Erreur lors de la récupération des checklists ICM:', error);
      throw new InternalServerErrorException('Erreur lors de la récupération des checklists du dashboard ICM');
    }
  }

  /**
   * Récupère les périodes disponibles avec des données
   */
  async getAvailablePeriods(): Promise<PeriodDto[]> {
    try {
      const periods = await this.checklistRepository
        .createQueryBuilder('checklist')
        .select('DISTINCT checklist.month', 'month')
        .addSelect('DISTINCT checklist.year', 'year')
        .where('checklist.status = :status', { status: ChecklistStatus.VALIDE })
        .orderBy('checklist.year', 'DESC')
        .addOrderBy('checklist.month', 'DESC')
        .getRawMany();

      return periods.map((p) => ({
        month: p.month,
        year: p.year,
        label: this.formatPeriod(p.month, p.year),
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des périodes disponibles:', error);
      return [];
    }
  }
}
