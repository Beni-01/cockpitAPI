import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsBoolean, Min } from 'class-validator';


export class CreateDisbursementDto {


  @ApiProperty({ example: '2025-11-18T00:00:00.000Z' })
  @IsNotEmpty()
  @IsString()
  documentDate: Date;

  @ApiProperty({ example: 'REPARATION' })
  @IsNotEmpty()
  @IsString()
  direction: string;

  @ApiProperty({ example: 'DF/UK/172/11/2025' })
  @IsNotEmpty()
  @IsString()
  reference: string;

  @ApiProperty({ example: 'TRAVAUX PRELIMINAIRE DANS LE CADRE DU PROGRAMME PILOTE DE READAPTATION' })
  @IsNotEmpty()
  @IsString()
  expenseNature: string;

  @ApiProperty({ example: 'JONATHAN DITUTU' })
  @IsNotEmpty()
  @IsString()
  beneficiary: string;


  @ApiProperty({ example: '2025-11-18T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  datePayment?: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  eurAmount?: number;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  cdfAmount?: number;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiProperty({ example: 4780 })
  @IsNotEmpty()
  @IsNumber()
  usdAmount: number;

  @ApiProperty({ example: 'SOFIBANQUE' })
  @IsNotEmpty()
  @IsString()
  paymentSource: string;

  @ApiProperty({ example: 'FED' })
  @IsNotEmpty()
  @IsString()
  supportingDocumentation: string;

  @ApiPropertyOptional({ example: 'EXECUTE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Decembre' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional({ example: 'SEMAINE DU 08 au 12 Decembre 2025' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ example: 'Notes additionnelles' })
  @IsOptional()
  @IsString()
  notes?: string;
}


export class DisbursementFilterDto {
  @ApiPropertyOptional({ example: 'REPARATION' })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiPropertyOptional({ example: '2025-11-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-11-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;


  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'SOFIBANQUE' })
  @IsOptional()
  @IsString()
  paymentSource?: string;

  @ApiPropertyOptional({ example: 'Decembre' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional({ example: 'SEMAINE DU 08 au 12 Decembre 2025' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ example: 'JONATHAN DITUTU' })
  @IsOptional()
  @IsString()
  beneficiary?: string;


  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}



export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Données paginées' })
  data: T[];

  @ApiProperty({ example: 100, description: 'Nombre total d\'éléments' })
  total: number;

  @ApiProperty({ example: 1, description: 'Page actuelle' })
  page: number;

  @ApiProperty({ example: 10, description: 'Nombre d\'éléments par page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Nombre total de pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Page suivante disponible' })
  hasNextPage: boolean;

  @ApiProperty({ example: false, description: 'Page précédente disponible' })
  hasPreviousPage: boolean;
}


export class DisbursementPeriodFilterDto {
  page?: number = 1;
  limit?: number = 10;
  period?: string;
}
