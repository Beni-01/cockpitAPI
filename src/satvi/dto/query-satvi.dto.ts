import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SatviStatus, SatviTypeMission } from '../entities/satvi-questionnaire.entity';

export enum SatviSortBy {
  CREATED_AT = 'createdAt',
  PERIODE_DU = 'periodeDu',
  PERIODE_AU = 'periodeAu',
  SCORE_GLOBAL = 'scoreGlobal',
  EVALUATION_AVERAGE = 'evaluationAverage',
  APPRECIATION_GLOBALE = 'appreciationGlobale',
}

export class QuerySatviDto {
  @ApiPropertyOptional({ description: 'Numero de page', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Nombre de lignes par page (max 100)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Recherche libre (reference, province, direction)', example: 'Kin' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par reference', example: 'SATVI-20260519' })
  @IsOptional()
  @IsString()
  referenceCode?: string;

  @ApiPropertyOptional({ description: 'Filtrer par mission SatVi', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  missionId?: number;

  @ApiPropertyOptional({ description: 'Filtrer par direction metier', example: 'Direction des coordinations' })
  @IsOptional()
  @IsString()
  directionMetier?: string;

  @ApiPropertyOptional({ description: 'Alias front-end pour directionMetier', example: 'Direction technique' })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiPropertyOptional({ description: 'Filtrer par province visitee', example: 'Kinshasa' })
  @IsOptional()
  @IsString()
  provinceVisitee?: string;

  @ApiPropertyOptional({ description: 'Alias front-end pour provinceVisitee', example: 'Nord-Kivu' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Filtrer par type de mission', enum: SatviTypeMission })
  @IsOptional()
  @IsEnum(SatviTypeMission)
  typeMission?: SatviTypeMission;

  @ApiPropertyOptional({ description: 'Filtrer par statut', enum: SatviStatus })
  @IsOptional()
  @IsEnum(SatviStatus)
  status?: SatviStatus;

  @ApiPropertyOptional({ description: 'Date debut minimum (periodeDu >=)', example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({ description: 'Date fin maximum (periodeAu <=)', example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({ description: 'Score global minimum', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  scoreMin?: number;

  @ApiPropertyOptional({ description: 'Score global maximum', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  scoreMax?: number;

  @ApiPropertyOptional({ description: 'Filtrer les signaux d alerte', example: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  dysfonctionnementMajeur?: boolean;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: SatviSortBy,
    default: SatviSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SatviSortBy)
  sortBy?: SatviSortBy = SatviSortBy.CREATED_AT;

  @ApiPropertyOptional({ description: 'Ordre de tri', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
