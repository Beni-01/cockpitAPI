import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FilterIcmTacheDashboardDto {
  @ApiPropertyOptional({ description: 'ID de la coordination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coordinationId?: number;

  @ApiPropertyOptional({ description: 'Domaine de la tâche' })
  @IsOptional()
  @IsString()
  domaine?: string;

  @ApiPropertyOptional({
    description: 'Début de la période au format ISO',
    example: '2026-05-01',
  })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({
    description: 'Fin de la période au format ISO',
    example: '2026-06-30',
  })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({ description: 'Recherche textuelle' })
  @IsOptional()
  @IsString()
  search?: string;
}
