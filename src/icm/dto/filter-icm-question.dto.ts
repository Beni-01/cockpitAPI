import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { IcmCategory, IcmPeriodicity } from '../enums';

export class FilterIcmQuestionDto {
  @ApiPropertyOptional({
    description: 'Filtrer par catégorie',
    enum: IcmCategory,
  })
  @IsOptional()
  @IsEnum(IcmCategory, { message: 'La catégorie n\'est pas valide' })
  category?: IcmCategory;

  @ApiPropertyOptional({
    description: 'Filtrer par périodicité',
    enum: IcmPeriodicity,
  })
  @IsOptional()
  @IsEnum(IcmPeriodicity, {
    message: 'La périodicité n\'est pas valide',
  })
  periodicity?: IcmPeriodicity;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif/inactif',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;

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
