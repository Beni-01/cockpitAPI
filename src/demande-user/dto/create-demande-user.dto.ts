import { IsNumber, IsNotEmpty, IsOptional } from "class-validator";

export class CreateDemandeUserDto {
        @IsNumber()
        @IsNotEmpty()
        userId:number;
    
        @IsNumber()
        @IsNotEmpty()
        demandeId:number;
    
        @IsOptional()
        isSign?:boolean;
    
        @IsOptional()
        date_signature?:Date;
}
