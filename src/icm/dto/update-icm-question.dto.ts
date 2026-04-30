import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { IcmCategory, IcmPeriodicity } from '../enums';

export class UpdateIcmQuestionDto {
  @ApiPropertyOptional({
    description: 'Libellé de la tâche/question ICM',
    example: 'Entretiens mensuels individuels réalisés',
  })
  @IsOptional()
  @IsString({ message: 'Le libellé doit être une chaîne de caractères' })
  label?: string;

  @ApiPropertyOptional({
    description: 'Catégorie ICM',
    enum: IcmCategory,
  })
  @IsOptional()
  @IsEnum(IcmCategory, { message: 'La catégorie n\'est pas valide' })
  category?: IcmCategory;

  @ApiPropertyOptional({
    description: 'Périodicité de la tâche',
    enum: IcmPeriodicity,
  })
  @IsOptional()
  @IsEnum(IcmPeriodicity, {
    message: 'La périodicité n\'est pas valide',
  })
  periodicity?: IcmPeriodicity;

  @ApiPropertyOptional({
    description: 'Preuve attendue pour la conformité',
  })
  @IsOptional()
  @IsString({ message: 'La preuve attendue doit être une chaîne' })
  expectedProof?: string;

  @ApiPropertyOptional({
    description: 'Ordre d\'affichage dans la checklist',
  })
  @IsOptional()
  @IsInt({ message: 'L\'ordre doit être un entier' })
  @Min(1, { message: 'L\'ordre doit être au minimum 1' })
  order?: number;
}
