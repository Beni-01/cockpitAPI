
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
  @IsNotEmpty()
  @IsString()
  debut: string;

  @ApiProperty({ description: 'Date de fin de la sous-activité', example: '2024-11-30' })
  @IsNotEmpty()
  @IsString()
  fin: string;

  @ApiProperty({ description: 'Indicateur de la sous-activité', example: 'Achèvement' })
  @IsNotEmpty()
  @IsString()
  indicateur: string;

  @ApiProperty({ description: 'Budget alloué à la sous-activité', example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @ApiProperty({ description: 'Livrable attendu de la sous-activité', example: 'Rapport final' })
  @IsNotEmpty()
  @IsString()
  livrable: string;

  @ApiProperty({ description: 'User qui crée la sous activité', example: 12 })
  @IsNotEmpty()
  @IsNumber()
  userId:number

  @ApiProperty({ description: 'ID  activité principale', example: 12 })
  @IsNotEmpty()
  @IsNumber()
  activityId:number

}