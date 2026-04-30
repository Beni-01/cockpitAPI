import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { IcmCategory, IcmPeriodicity } from '../enums';

export class CreateIcmQuestionDto {
  @ApiProperty({
    description: 'Libellé de la tâche/question ICM',
    example: 'Entretiens mensuels individuels réalisés',
  })
  @IsNotEmpty({ message: 'Le libellé est requis' })
  @IsString({ message: 'Le libellé doit être une chaîne de caractères' })
  label: string;

  @ApiProperty({
    description: 'Catégorie ICM',
    enum: IcmCategory,
    example: IcmCategory.RH,
  })
  @IsNotEmpty({ message: 'La catégorie est requise' })
  @IsEnum(IcmCategory, { message: 'La catégorie n\'est pas valide' })
  category: IcmCategory;

  @ApiProperty({
    description: 'Périodicité de la tâche',
    enum: IcmPeriodicity,
    example: IcmPeriodicity.MENSUEL,
  })
  @IsNotEmpty({ message: 'La périodicité est requise' })
  @IsEnum(IcmPeriodicity, {
    message: 'La périodicité n\'est pas valide',
  })
  periodicity: IcmPeriodicity;

  @ApiProperty({
    description: 'Preuve attendue pour la conformité',
    example: 'Fiche d\'entretien signée par les agents et le coordonnateur',
  })
  @IsNotEmpty({ message: 'La preuve attendue est requise' })
  @IsString({ message: 'La preuve attendue doit être une chaîne' })
  expectedProof: string;

  @ApiProperty({
    description: 'Ordre d\'affichage dans la checklist',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ordre est requis' })
  @IsInt({ message: 'L\'ordre doit être un entier' })
  @Min(1, { message: 'L\'ordre doit être au minimum 1' })
  order: number;
}
