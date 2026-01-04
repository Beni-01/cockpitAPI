// src/budget/dto/create-budget.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateBudgetDto {
  @IsOptional()
  @IsString()
  costCenter?: string;

  @IsOptional()
  @IsString()
  descriptionCc?: string;

  @IsOptional()
  @IsString()
  provinceVille?: string;

  @IsOptional()
  @IsString()
  coordinationsProvinciales?: string;

  @IsOptional()
  @IsString()
  localEtranger?: string;

  @IsOptional()
  @IsString()
  categorieGrade?: string;

  @IsOptional()
  @IsString()
  natureDepenses?: string;

  @IsOptional()
  @IsString()
  accountOhada?: string;

  @IsOptional()
  @IsString()
  departement?: string;

  @IsOptional()
  @IsString()
  texteLibelle?: string;

  @IsOptional()
  @IsString()
  uniteMesure?: string;

  @IsOptional()
  @IsString()
  coutUnitaireUsd?: string;

  @IsOptional() @IsString() jan?: string;
  @IsOptional() @IsString() feb?: string;
  @IsOptional() @IsString() mar?: string;
  @IsOptional() @IsString() apr?: string;
  @IsOptional() @IsString() may?: string;
  @IsOptional() @IsString() jun?: string;
  @IsOptional() @IsString() jul?: string;
  @IsOptional() @IsString() aug?: string;
  @IsOptional() @IsString() sep?: string;
  @IsOptional() @IsString() oct?: string;
  @IsOptional() @IsString() nov?: string;
  @IsOptional() @IsString() dec?: string;

  @IsOptional() @IsString() totalUnits?: string;
  @IsOptional() @IsString() totalBudgetUsd?: string;

  @IsOptional() @IsNumber() departmentId?: number;
  @IsOptional() @IsNumber() mappingCashFlowId?: number;
  @IsOptional() @IsNumber() activityId?: number;
  @IsOptional() @IsNumber() sousActivityId?: number;
  @IsOptional() @IsNumber() tacheId?: number;
}
