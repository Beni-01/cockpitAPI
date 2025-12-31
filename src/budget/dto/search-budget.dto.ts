import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FilterOperator {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  IN = 'in',
  LIKE = 'like',
  BETWEEN = 'between',
}

export class FilterDto {
  @ApiProperty({ type: String })
  @IsString()
  field: string;

  @ApiProperty({ enum: FilterOperator })
  @IsEnum(FilterOperator)
  operator: FilterOperator;
  
  @ApiProperty({ type: Object, description: 'Value to compare (type depends on field/operator)' })
  @IsNotEmpty()
  value: any;
  @ApiPropertyOptional({ type: Object, description: 'Second value for BETWEEN operator' })
  @IsOptional()
  valueTo?: any;
}

export class SortDto {
  @ApiProperty({ type: String, description: 'Field to sort by' })
  @IsString()
  by: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], description: 'Sort order' })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';
}

export class SearchBudgetDto {
  @ApiPropertyOptional({ type: FilterDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[];

  @ApiPropertyOptional({ type: String, description: 'Global search string' })
  @IsOptional()
  @IsString()
  global_search?: string;

  @ApiPropertyOptional({ type: String, isArray: true, description: 'List of fields to return' })
  @IsOptional()
  @Type(() => Object)
  fields?: string[];

  @ApiPropertyOptional({ type: Number, description: 'Page number (1-based)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size / limit' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ type: SortDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SortDto)
  sort?: SortDto;
}
