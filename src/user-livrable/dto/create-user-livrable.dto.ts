import { IsNumber, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserLivrableDto {
    @IsNumber()
    @IsNotEmpty()
    userId:number;

    @IsNumber()
    @IsNotEmpty()
    livrableId:number;

    @IsOptional()
    isSign?:boolean;

    @IsOptional()
    date_signature?:Date;

}
