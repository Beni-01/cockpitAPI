import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { AntenneStatus } from '../entities/antenne.entity';

export class CreateAntenneDto {
  @ApiProperty({ example: 'Antenne Lubumbashi Centre' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({ example: 'ANT-HK-01' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Avenue Lumumba, n°123, Lubumbashi' })
  @IsString()
  @IsOptional()
  adresse?: string;

  @ApiPropertyOptional({ example: 'Jean Kabongo' })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({ enum: AntenneStatus, example: AntenneStatus.ACTIVE })
  @IsEnum(AntenneStatus)
  @IsOptional()
  status?: AntenneStatus;

  @ApiProperty({ example: 1, description: 'ID de la coordination provinciale' })
  @IsInt()
  @IsNotEmpty()
  coordinationId: number;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(0)
  @IsOptional()
  nombreAgents?: number;
}
