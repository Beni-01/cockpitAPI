import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SatviMissionStatus, SatviTypeMission } from '../entities';

export enum SatviMissionSortBy {
  CREATED_AT = 'createdAt',
  DATE_DEBUT = 'dateDebut',
  DATE_FIN = 'dateFin',
  TITRE = 'titre',
  STATUS = 'status',
}

export class QuerySatviMissionDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Recherche libre titre, reference, province, coordination' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par province' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Filtrer par coordination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  coordinationId?: number;

  @ApiPropertyOptional({ enum: SatviTypeMission })
  @IsOptional()
  @IsEnum(SatviTypeMission)
  typeMission?: SatviTypeMission;

  @ApiPropertyOptional({ enum: SatviMissionStatus })
  @IsOptional()
  @IsEnum(SatviMissionStatus)
  status?: SatviMissionStatus;

  @ApiPropertyOptional({ description: 'Date de debut minimum', example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({ description: 'Date de fin maximum', example: '2026-04-30' })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({ description: 'Retourner uniquement les missions avec alerte' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  avecAlerte?: boolean;

  @ApiPropertyOptional({ enum: SatviMissionSortBy, default: SatviMissionSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(SatviMissionSortBy)
  sortBy?: SatviMissionSortBy = SatviMissionSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
