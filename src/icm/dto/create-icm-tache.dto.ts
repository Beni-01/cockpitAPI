import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IcmAssignmentScope, IcmPeriodicity } from '../enums';

export class CreateIcmTacheDto {
  @ApiProperty({
    description: 'Domaine de la tâche ICM',
    example: 'Ressources Humaines',
  })
  @IsNotEmpty({ message: 'Le domaine est requis' })
  @IsString({ message: 'Le domaine doit être une chaîne' })
  domaine: string;

  @ApiProperty({
    description: 'Libellé de la tâche managériale',
    example: 'Entretiens mensuels réalisés',
  })
  @IsNotEmpty({ message: 'La tâche managériale est requise' })
  @IsString({ message: 'La tâche managériale doit être une chaîne' })
  tacheManageriale: string;

  @ApiPropertyOptional({ description: 'Description détaillée de la tâche' })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne' })
  description?: string;

  @ApiProperty({
    description: 'Livrable attendu',
    example: 'Rapport',
  })
  @IsNotEmpty({ message: 'Le livrable attendu est requis' })
  @IsString({ message: 'Le livrable attendu doit être une chaîne' })
  livrableAttendu: string;

  @ApiProperty({
    description: 'Périodicité de la tâche',
    enum: IcmPeriodicity,
    example: IcmPeriodicity.HEBDOMADAIRE,
  })
  @IsEnum(IcmPeriodicity, {
    message: 'La périodicité n’est pas valide',
  })
  periodicite: IcmPeriodicity;

  @ApiProperty({ description: 'Date de début', example: '2026-06-01' })
  @IsDateString({}, { message: 'La date de début n’est pas valide' })
  dateDebut: string;

  @ApiProperty({ description: 'Date limite', example: '2026-06-30' })
  @IsDateString({}, { message: 'La date limite n’est pas valide' })
  dateLimite: string;

  @ApiPropertyOptional({
    description: 'Portée de l’assignation',
    enum: IcmAssignmentScope,
    default: IcmAssignmentScope.ALL_PROVINCES,
  })
  @IsOptional()
  @IsEnum(IcmAssignmentScope, {
    message: 'La portée de l’assignation n’est pas valide',
  })
  porteeAssignation?: IcmAssignmentScope;

  @ApiPropertyOptional({
    description: 'Provinces ciblées',
    type: [String],
    example: ['Kinshasa', 'Haut-Katanga'],
  })
  @IsOptional()
  @IsArray({ message: 'Les provinces assignées doivent être une liste' })
  @IsString({
    each: true,
    message: 'Chaque province assignée doit être une chaîne',
  })
  provincesAssignees?: string[];

  @ApiPropertyOptional({ description: 'Instructions spécifiques' })
  @IsOptional()
  @IsString({ message: 'Les instructions doivent être une chaîne' })
  instructionsSpecifiques?: string;

  @ApiPropertyOptional({ description: 'Ordre d’affichage', default: 1 })
  @IsOptional()
  @IsInt({ message: 'L’ordre doit être un entier' })
  @Min(1, { message: 'L’ordre doit être supérieur ou égal à 1' })
  ordre?: number;

  @ApiPropertyOptional({ description: 'Statut actif', default: true })
  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booléen' })
  isActive?: boolean;
}
