import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateActivite26Dto {

  @IsString()
  @IsNotEmpty()
  objectif: string;

  @IsString()
  @IsNotEmpty()
  activite: string;

  @IsString()
  @IsOptional()
  T1: string;

  @IsString()
  @IsOptional()
  T2: string;

  @IsString()
  @IsOptional()
  T3: string;

  @IsString()
  @IsOptional()
  T4: string;

  @IsNumber()
  budget: number;

  @IsString()
  @IsNotEmpty()
  direction: string;

  @IsString()
  @IsOptional()
  observation: string;
}
