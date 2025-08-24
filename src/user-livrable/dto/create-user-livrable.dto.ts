import { IsNumber, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserLivrableDto {
    @IsNumber()
    @IsNotEmpty()
    userId:number;

    @IsNumber()
    @IsNotEmpty()
    livrableId:number;

    @IsOptional()
    isValidate?:boolean;

    @IsOptional()
    @IsString()
    comment?:string

    @IsOptional()
    date_signature?:Date;

}
