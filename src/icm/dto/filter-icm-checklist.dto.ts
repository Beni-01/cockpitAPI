import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ChecklistStatus } from '../enums';

export class FilterIcmChecklistDto {
  @ApiPropertyOptional({
    description: 'ID de la coordination',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'L\'ID coordination doit être un entier' })
  coordinationId?: number;

  @ApiPropertyOptional({
    description: 'Mois (1-12)',
    example: 4,
  })
  @IsOptional()
  @IsInt({ message: 'Le mois doit être un entier' })
  @Min(1, { message: 'Le mois doit être entre 1 et 12' })
  @Max(12, { message: 'Le mois doit être entre 1 et 12' })
  month?: number;

  @ApiPropertyOptional({
    description: 'Année',
    example: 2026,
  })
  @IsOptional()
  @IsInt({ message: 'L\'année doit être un entier' })
  year?: number;

  @ApiPropertyOptional({
    description: 'Statut de la checklist',
    enum: ChecklistStatus,
  })
  @IsOptional()
  @IsEnum(ChecklistStatus, { message: 'Le statut n\'est pas valide' })
  status?: ChecklistStatus;

  @ApiPropertyOptional({
    description: 'Numéro de page (défaut: 1)',
    example: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page (défaut: 10)',
    example: 10,
  })
  @IsOptional()
  limit?: number;
}
