import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { CoordinationStatus, CoordinationType } from '../entities/coordination.entity';

export class CreateCoordinationDto {
  @ApiProperty({ example: 'Coordination Provinciale du Haut-Katanga' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ enum: CoordinationType, example: CoordinationType.RECOUVREMENT })
  @IsEnum(CoordinationType)
  @IsNotEmpty()
  type: CoordinationType;

  @ApiProperty({ example: 'Haut-Katanga' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiPropertyOptional({ example: 'Avenue Lumumba, n°45, Lubumbashi' })
  @IsString()
  @IsOptional()
  adresse?: string;

  @ApiPropertyOptional({ enum: CoordinationStatus, example: CoordinationStatus.ACTIVE })
  @IsEnum(CoordinationStatus)
  @IsOptional()
  status?: CoordinationStatus;

  @ApiPropertyOptional({ example: 'Jean-Pierre Kabongo' })
  @IsString()
  @IsOptional()
  coordonnateurNom?: string;

  @ApiPropertyOptional({ example: '+243 812 345 678' })
  @IsString()
  @IsOptional()
  coordonnateurTelephone?: string;

  @ApiPropertyOptional({ example: 'jp.kabongo@fonarev.cd' })
  @IsEmail()
  @IsOptional()
  coordonnateurEmail?: string;

  @ApiPropertyOptional({ example: 98 })
  @IsInt()
  @Min(0)
  @IsOptional()
  effectifActuel?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsInt()
  @Min(0)
  @IsOptional()
  effectifPrevu?: number;
}
