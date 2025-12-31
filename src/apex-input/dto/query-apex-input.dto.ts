import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryApexInputDto {
  @IsOptional()
  @IsString()
  cost_center?: string;

  @IsOptional()
  @IsNumberString()
  department_id?: number | string;

  @IsOptional()
  @IsString()
  account_ohada?: string;

  @IsOptional()
  @IsString()
  nature_depenses?: string;

  @IsOptional()
  @IsString()
  texte?: string;

  @IsOptional()
  @IsNumberString()
  tache_id?: number | string;

  @IsOptional()
  min_total?: number;

  @IsOptional()
  max_total?: number;

  @IsOptional()
  @IsNumberString()
  page?: number | string;

  @IsOptional()
  @IsNumberString()
  limit?: number | string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' | string;
}

export default QueryApexInputDto;
