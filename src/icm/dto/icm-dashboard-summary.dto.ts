import { ApiProperty } from '@nestjs/swagger';

export class PeriodDto {
  @ApiProperty({ description: 'Mois (1-12)', example: 4 })
  month: number;

  @ApiProperty({ description: 'Année', example: 2026 })
  year: number;

  @ApiProperty({
    description: 'Libellé formaté de la période',
    example: 'Avr 2026',
  })
  label: string;
}

export class StatisticsDto {
  @ApiProperty({
    description: 'Nombre de coordinations avec score >= 85%',
    example: 1,
  })
  managementSolide: number;

  @ApiProperty({
    description: 'Nombre de coordinations avec score entre 70% et 85%',
    example: 1,
  })
  acceptable: number;

  @ApiProperty({
    description: 'Nombre de coordinations avec score < 70%',
    example: 2,
  })
  faible: number;
}

export class CoordinationScoreRowDto {
  @ApiProperty({
    description: 'ID de la coordination',
    example: 1,
  })
  coordinationId: number;

  @ApiProperty({
    description: 'Nom de la coordination',
    example: 'Nord-Kivu',
  })
  coordinationName: string;

  @ApiProperty({
    description: 'Nombre total de tâches',
    example: 7,
  })
  totalTasks: number;

  @ApiProperty({
    description: 'Nombre de tâches conformes',
    example: 7,
  })
  conformes: number;

  @ApiProperty({
    description: 'Nombre de tâches partiellement conformes',
    example: 0,
  })
  partielles: number;

  @ApiProperty({
    description: 'Nombre de tâches non conformes',
    example: 0,
  })
  nonConformes: number;

  @ApiProperty({
    description: 'Score ICM en pourcentage',
    example: 100,
  })
  score: number;

  @ApiProperty({
    description: 'Statut de la coordination',
    example: 'Management Solide',
  })
  status: string;
}

export class NationalScoreRowDto {
  @ApiProperty({
    description: 'Libellé de la ligne',
    example: 'Score national',
  })
  label: string;

  @ApiProperty({
    description: 'Nombre total de tâches',
    example: 28,
  })
  totalTasks: number;

  @ApiProperty({
    description: 'Nombre total de tâches conformes',
    example: 17,
  })
  conformes: number;

  @ApiProperty({
    description: 'Nombre total de tâches partiellement conformes',
    example: 3,
  })
  partielles: number;

  @ApiProperty({
    description: 'Nombre total de tâches non conformes',
    example: 8,
  })
  nonConformes: number;

  @ApiProperty({
    description: 'Score national en pourcentage',
    example: 66,
  })
  score: number;

  @ApiProperty({
    description: 'Statut national',
    example: 'Faible',
  })
  status: string;
}

export class IcmDashboardSummaryResponseDto {
  @ApiProperty({
    description: 'Informations sur la période sélectionnée',
    type: PeriodDto,
  })
  period: PeriodDto;

  @ApiProperty({
    description: 'Score national en pourcentage',
    example: 66,
  })
  nationalScore: number;

  @ApiProperty({
    description: 'Statut national',
    example: 'Faible',
  })
  nationalStatus: string;

  @ApiProperty({
    description: 'Statistiques agrégées par statut',
    type: StatisticsDto,
  })
  stats: StatisticsDto;

  @ApiProperty({
    description: 'Scores par coordination',
    type: [CoordinationScoreRowDto],
  })
  rows: CoordinationScoreRowDto[];

  @ApiProperty({
    description: 'Ligne de totaux national',
    type: NationalScoreRowDto,
  })
  nationalRow: NationalScoreRowDto;
}

export class IcmChecklistItemDto {
  @ApiProperty({
    description: 'ID de la checklist ICM',
    example: 1,
  })
  checklistId: number;

  @ApiProperty({
    description: 'Nom de la coordination',
    example: 'Nord-Kivu',
  })
  coordinationName: string;

  @ApiProperty({
    description: 'Période (mois)',
    example: 4,
  })
  month: number;

  @ApiProperty({
    description: 'Année',
    example: 2026,
  })
  year: number;

  @ApiProperty({
    description: 'Statut de la checklist',
    example: 'Validé',
  })
  status: string;

  @ApiProperty({
    description: 'Score ICM',
    example: 100,
  })
  scoreICM: number;

  @ApiProperty({
    description: 'Nom du créateur',
    example: 'Jean Dupont',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-04-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Statut de validation',
    example: 'Validé par Admin',
  })
  validationStatus: string;
}

export class IcmDashboardChecklistsResponseDto {
  @ApiProperty({
    description: 'Informations sur la période sélectionnée',
    type: PeriodDto,
  })
  period: PeriodDto;

  @ApiProperty({
    description: 'Liste des checklists',
    type: [IcmChecklistItemDto],
  })
  checklists: IcmChecklistItemDto[];

  @ApiProperty({
    description: 'Nombre total de checklists',
    example: 4,
  })
  total: number;
}

export class ConsolidatedChecklistItemDto {
  @ApiProperty({
    description: 'Nom de la coordination',
    example: 'Nord-Kivu',
  })
  coordinationName: string;

  @ApiProperty({
    description: 'Catégorie',
    example: 'RH',
  })
  category: string;

  @ApiProperty({
    description: 'Question/Tâche',
    example: 'Entretiens mensuels individuels réalisés',
  })
  question: string;

  @ApiProperty({
    description: 'Niveau de conformité',
    example: 'Conforme',
  })
  conformityLevel: string;

  @ApiProperty({
    description: 'Score (0, 0.5 ou 1)',
    example: 1,
  })
  scoreItem: number;

  @ApiProperty({
    description: 'Preuve fournie',
    example: 'https://bucket.s3.com/entretien-avril-2026.pdf',
  })
  proofProvided: string;

  @ApiProperty({
    description: 'Commentaire',
    example: 'Tous les entretiens ont été réalisés',
  })
  comment: string;
}

export class IcmDashboardConsolidatedResponseDto {
  @ApiProperty({
    description: 'Informations sur la période sélectionnée',
    type: PeriodDto,
  })
  period: PeriodDto;

  @ApiProperty({
    description: 'Données consolidées détaillées',
    type: [ConsolidatedChecklistItemDto],
  })
  data: ConsolidatedChecklistItemDto[];

  @ApiProperty({
    description: 'Nombre total de réponses',
    example: 112,
  })
  total: number;
}
