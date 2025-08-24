import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class CreateAnnotationActivityDto {
    @ApiProperty({ description: "Texte de l'annotation" })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ description: "Type d'annotation" })
    @IsString()
    @IsOptional()
    type:string

    @ApiProperty({ description: "ID du conflit associé à l'annotation" })
    @IsNumber()
    @IsNotEmpty()
    activityId: number;

    @ApiProperty({ description: "ID de l'utilisateur associé à l'annotation" })
    @IsNumber()
    @IsNotEmpty()
    userId: number;
}
