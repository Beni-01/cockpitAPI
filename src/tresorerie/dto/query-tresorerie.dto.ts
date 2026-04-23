import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TypeMouvement } from '../entities/tresorerie.entity';

export class QueryTresorerieDto {
  // ── Pagination ─────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Numéro de la page (commence à 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page (max 100)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // ── Filtres ────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: "Filtrer par type de mouvement ('entree' ou 'sortie')",
    enum: TypeMouvement,
    example: TypeMouvement.SORTIE,
  })
  @IsOptional()
  @IsEnum(TypeMouvement)
  typeMouvement?: TypeMouvement;

  @ApiPropertyOptional({
    description: 'Filtrer par coordination provinciale (recherche partielle)',
    example: 'Nord-Kivu',
  })
  @IsOptional()
  @IsString()
  coordination?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par motif (recherche partielle, insensible à la casse)',
    example: 'carburant',
  })
  @IsOptional()
  @IsString()
  motif?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par référence FED (recherche partielle)',
    example: 'FED-DEP-2026',
  })
  @IsOptional()
  @IsString()
  referenceFed?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par bénéficiaire (recherche partielle)',
    example: 'Vodacom',
  })
  @IsOptional()
  @IsString()
  beneficiaire?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par agent de saisie (recherche partielle)',
    example: 'Jean-Pierre',
  })
  @IsOptional()
  @IsString()
  agentSaisi?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par devise',
    example: 'FC',
  })
  @IsOptional()
  @IsString()
  devise?: string;

  @ApiPropertyOptional({
    description: 'Date de début (YYYY-MM-DD) — filtre sur dateOperation',
    example: '2026-04-01',
  })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (YYYY-MM-DD) — filtre sur dateOperation',
    example: '2026-04-30',
  })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({
    description: 'Montant minimum',
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  montantMin?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum',
    example: 5000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  montantMax?: number;
}
