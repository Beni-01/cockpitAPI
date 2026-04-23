import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TypeMouvement } from '../entities/tresorerie.entity';

export class CreateTresorerieDto {
  @ApiProperty({
    description: 'Date de réalisation de l\'opération (YYYY-MM-DD)',
    example: '2026-04-22',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOperation: string;

  @ApiProperty({
    description: "Type de mouvement : 'entree' ou 'sortie'",
    enum: TypeMouvement,
    example: TypeMouvement.SORTIE,
  })
  @IsEnum(TypeMouvement)
  @IsNotEmpty()
  typeMouvement: TypeMouvement;

  @ApiProperty({
    description: 'Coordination provinciale concernée',
    example: 'Nord-Kivu',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  coordination: string;

  @ApiProperty({
    description: 'Motif ou libellé du mouvement',
    example: 'Frais de communication',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  motif: string;

  @ApiPropertyOptional({
    description: 'Référence FED unique',
    example: 'FED-DEP-2026-04-009',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  referenceFed?: string;

  @ApiPropertyOptional({
    description: 'Bénéficiaire du mouvement',
    example: 'Vodacom RDC',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  beneficiaire?: string;

  @ApiProperty({
    description: 'Montant du mouvement en FC',
    example: 320000,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montant: number;

  @ApiPropertyOptional({
    description: 'Solde de la caisse après le mouvement',
    example: 31680000,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  soldeApres?: number;

  @ApiPropertyOptional({
    description: 'Devise (FC par défaut)',
    example: 'FC',
    maxLength: 10,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  devise?: string;

  @ApiPropertyOptional({
    description: "Agent ayant saisi le mouvement",
    example: 'Jean-Pierre Kabila',
    maxLength: 150,
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  agentSaisi?: string;

  @ApiPropertyOptional({
    description: 'Observation ou commentaire libre',
    example: 'Approuvé par le chef de section',
  })
  @IsString()
  @IsOptional()
  observation?: string;
}
