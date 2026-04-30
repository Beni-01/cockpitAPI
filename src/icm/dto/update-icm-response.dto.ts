import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ConformityLevel } from '../enums';

export class UpdateIcmResponseDto {
  @ApiProperty({
    description: 'ID de la réponse',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de la réponse est requis' })
  @IsInt({ message: 'L\'ID de la réponse doit être un entier' })
  id: number;

  @ApiProperty({
    description: 'Indique si la tâche a été réalisée',
    example: true,
  })
  @IsNotEmpty({ message: 'Le statut réalisé est requis' })
  @IsBoolean({ message: 'La réalisation doit être un booléen' })
  realised: boolean;

  @ApiPropertyOptional({
    description: 'Niveau de conformité',
    enum: ConformityLevel,
    example: ConformityLevel.CONFORME,
  })
  @IsOptional()
  @IsEnum(ConformityLevel, {
    message: 'Le niveau de conformité n\'est pas valide',
  })
  conformityLevel?: ConformityLevel;

  @ApiPropertyOptional({
    description: 'Commentaire sur la réponse',
  })
  @IsOptional()
  @IsString({ message: 'Le commentaire doit être une chaîne' })
  comment?: string;

  @ApiPropertyOptional({
    description: 'Preuve fournie (texte ou URL)',
  })
  @IsOptional()
  @IsString({ message: 'La preuve doit être une chaîne' })
  proofProvided?: string;
}
