import { IsNumber, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDemandeUserDto {
        @IsNumber()
        @IsNotEmpty()
        userId:number;
    
        @IsNumber()
        @IsNotEmpty()
        demandeId:number;
    
        @IsOptional()
        isValidate?:boolean;

        @IsOptional()
        @IsString()
        comment?:string
    
        @IsOptional()
        date_validation?:Date;
}
