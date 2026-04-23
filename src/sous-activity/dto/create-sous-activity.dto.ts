import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// ── DTO pour les userId à assigner à une sous-activité ───────────────────────

export class SousActivityAssignmentDto {
  @ApiProperty({ description: "ID de l'utilisateur à assigner à la sous-activité", example: 3 })
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

// ── DTO de création d'une sous-activité (embarquée dans l'activité) ──────────

export class CreateSousActivityDto {
  @ApiProperty({ description: 'Titre de la sous-activité', example: 'Formation' })
  @IsNotEmpty()
  @IsString()
  titre: string;

  @ApiProperty({ description: 'Résultat de la sous-activité', example: 'Objectifs atteints' })
  @IsNotEmpty()
  @IsString()
  resultat: string;

  @ApiProperty({ description: 'Province de la sous-activité', example: 'Kinshasa' })
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiProperty({ description: 'Responsable de la sous-activité', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  responsable: string;

  @ApiPropertyOptional({ description: 'Autre service lié', example: 'N/A' })
  @IsOptional()
  @IsString()
  autreService?: string;

  @ApiPropertyOptional({ description: 'Date de début', example: '2024-11-01' })
  @IsOptional()
  @IsString()
  debut?: string;

  @ApiPropertyOptional({ description: 'Date de fin', example: '2024-11-30' })
  @IsOptional()
  @IsString()
  fin?: string;

  @ApiPropertyOptional({ description: 'Indicateur', example: 'Achèvement' })
  @IsOptional()
  @IsString()
  indicateur?: string;

  // ── Champs budget — tous OPTIONNELS ─────────────────────────────────────

  @ApiPropertyOptional({ description: 'Budget alloué à la sous-activité', example: 10000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ description: 'Budget consommé à la sous-activité', example: 5000 })
  @IsOptional()
  @IsNumber()
  budgetConsomme?: number;

  @ApiPropertyOptional({ description: 'Observations ou commentaires', example: 'Besoin de plus de temps pour la validation' })
  @IsOptional()
  @IsString()
  observations?: string;

  // ── Autres champs optionnels ─────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Statut', example: 'En cours' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Livrable attendu', example: 'Rapport final' })
  @IsOptional()
  @IsString()
  livrable?: string;

  @ApiPropertyOptional({ description: 'Type de livrable', example: 'Rapport' })
  @IsOptional()
  @IsString()
  typelivrable?: string;

  @ApiProperty({ description: "ID de l'utilisateur créateur de la sous-activité", example: 12 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ description: "ID de l'activité principale (auto-injecté si non fourni)", example: 12 })
  @IsOptional()
  @IsNumber()
  activityId?: number;

  @ApiPropertyOptional({ description: 'Date fin réelle' })
  @IsOptional()
  @IsString()
  dateFinReel?: string;

  @ApiPropertyOptional({ description: 'Résultat obtenu' })
  @IsOptional()
  @IsString()
  resultatObtenu?: string;

  @ApiPropertyOptional({ description: 'Taux de deadline' })
  @IsOptional()
  @IsNumber()
  deadlineRate?: number;

  @ApiPropertyOptional({ description: 'Nombre de ressources' })
  @IsOptional()
  @IsNumber()
  nbre_ressource?: number;

  /**
   * Liste des userId à assigner à cette sous-activité.
   * Après création de la sous-activité, un UserActivitiesAssignment sera
   * automatiquement créé pour chaque userId avec le sousActivityId généré.
   */
  @ApiPropertyOptional({
    description:
      'Utilisateurs à assigner automatiquement à cette sous-activité après sa création.',
    type: [SousActivityAssignmentDto],
    example: [{ userId: 1 }, { userId: 2 }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SousActivityAssignmentDto)
  userActivitiesAssignments?: SousActivityAssignmentDto[];
}