import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateAccessFormsDto {

    @IsString()
    @IsNotEmpty()
    form: string;

    @IsNumber()
    @IsNotEmpty()
    userId:number
}