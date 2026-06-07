import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IcmPeriodicity } from '../enums';

export class FilterIcmTacheDto {
  @ApiPropertyOptional({ description: 'Filtrer par domaine' })
  @IsOptional()
  @IsString()
  domaine?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par périodicité',
    enum: IcmPeriodicity,
  })
  @IsOptional()
  @IsEnum(IcmPeriodicity)
  periodicite?: IcmPeriodicity;

  @ApiPropertyOptional({
    description: 'Recherche dans la tâche, le domaine et le livrable',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut actif' })
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true'
      ? true
      : value === false || value === 'false'
        ? false
        : value,
  )
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
