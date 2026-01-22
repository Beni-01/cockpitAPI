
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateTransactionDto {

    @IsNumber()
    @IsOptional()
    depense:number;

    @IsNumber()
    @IsOptional()
    depense_init:number;

    @IsString()
    @IsOptional()
    description:string

    @IsString()
    @IsOptional()
    ref:string;

    @IsString()
    @IsOptional()
    code:string;

    @IsString()
    @IsOptional()
    devise:string

    @IsString()
    @IsOptional()
    devise_convert:string

    @IsString()
    @IsOptional()
    agent:string

    @IsNumber()
    @IsOptional()
    centreId:number

    @IsString()
    @IsOptional()
    createdAt:string
    
}

export class DeleteTransactionsDto {
  @IsArray()
  @ArrayNotEmpty()
  ids: number[];
}


export class DeleteTransactionObjectDto {
  @IsString()
  @IsOptional()
  ref?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  devise?: string;

  @IsString()
  @IsOptional()
  devise_convert?: string;

  @IsNumber()
  @IsOptional()
  depense?: number;
}

export class DeleteTransactionsArrayDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DeleteTransactionObjectDto)
  transactions: DeleteTransactionObjectDto[];
}
