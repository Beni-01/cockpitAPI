
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { UpdateSousActivityDto } from './update-sous-activity.dto';

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

  @ApiProperty({ description: 'Autre service lié à la sous-activité', example: 'N/A', required: false })
  @IsOptional()
  @IsString()
  autreService: string;

  @ApiProperty({ description: 'Date de début de la sous-activité', example: '2024-11-01' })
  @IsOptional()
  @IsString()
  debut: string;

  @ApiProperty({ description: 'Date de fin de la sous-activité', example: '2024-11-30' })
  @IsOptional()
  @IsString()
  fin: string;

  @ApiProperty({ description: 'Indicateur de la sous-activité', example: 'Achèvement' })
  @IsOptional()
  @IsString()
  indicateur: string;

  @ApiProperty({ description: 'Budget alloué à la sous-activité', example: 10000 })
  @IsOptional()
  @IsNumber()
  budget: number;

  @ApiProperty({
    description: 'Le statut de l\'activité',
    type: String,
    example: 'En cours',
    required: false,  // Ce champ est optionnel
})
@IsOptional()  // Le champ est optionnel
@IsString()  // Vérifie que c\'est une chaîne de caractères
status?: string;

  @ApiProperty({ description: 'Livrable attendu de la sous-activité', example: 'Rapport final' })
  @IsNotEmpty()
  @IsString()
  livrable: string;

  @ApiProperty({ description: 'Type de Livrable attendu de la sous-activité', example: 'Rapport final' })
  @IsOptional()
  @IsString()
  typelivrable: string;

  @ApiProperty({ description: 'User qui crée la sous activité', example: 12 })
  @IsNotEmpty()
  @IsNumber()
  userId:number

  @ApiProperty({ description: 'ID  activité principale', example: 12 })
  @IsNotEmpty()
  @IsNumber()
  activityId:number

  @ApiProperty({ description: 'Date fin réel sous activité'})
  @IsOptional()
  @IsString()
  dateFinReel:string

  @ApiProperty({ description: 'Resultat obtenus'})
  @IsOptional()
  @IsString()
  resultatObtenu:string

  @ApiProperty({ description: 'Budget consommé à la sous-activité', example: 5000 })
  @IsOptional()
  @IsNumber()
  budgetConsomme:number
}