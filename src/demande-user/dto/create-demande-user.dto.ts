import { IsNumber, IsNotEmpty, IsOptional } from "class-validator";

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
        date_validation?:Date;
}
