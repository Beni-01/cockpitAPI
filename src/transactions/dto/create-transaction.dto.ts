
import { IsNumber, IsOptional, IsString } from "class-validator";

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
