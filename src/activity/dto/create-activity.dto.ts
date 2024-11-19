import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';  // Pour Swagger
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDateString, IsInt, Min, Max, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';  // Pour class-validator
import { UpdateSousActivityDto } from 'src/sous-activity/dto/update-sous-activity.dto';

export class CreateActivityDto {
    @ApiProperty({
        description: 'Le titre de l\'activité',
        type: String,
        example: 'Réunion de travail',
    })
    @IsString()  // Vérifie que le champ est une chaîne de caractères
    @IsNotEmpty()  // Le titre ne peut pas être vide
    titre: string;

    @ApiProperty({
        description: 'La description de l\'activité',
        type: String,
        example: 'Réunion pour discuter des projets futurs',
        required: false,  // Ce champ est optionnel
    })
    @IsOptional()  // Le champ est optionnel
    @IsString()  // Vérifie que c\'est une chaîne de caractères
    description?: string;

    @ApiProperty({
        description: 'La date de début de l\'activité',
        type: String,
        format: 'date',
        example: '2024-11-20',
        required: false,  // Ce champ est optionnel
    })
    @IsOptional()  // Le champ est optionnel
    @IsDateString()  // Vérifie que la valeur est une date valide
    dateDebut?: string;

    @ApiProperty({
        description: 'La date de fin de l\'activité',
        type: String,
        format: 'date',
        example: '2024-11-22',
        required: false,  // Ce champ est optionnel
    })
    @IsOptional()  // Le champ est optionnel
    @IsDateString()  // Vérifie que la valeur est une date valide
    dateFin?: string;

    @ApiProperty({
        description: 'Le statut de l\'activité',
        type: String,
        example: 'En cours',
        required: false,  // Ce champ est optionnel
    })
    @IsOptional()  // Le champ est optionnel
    @IsString()  // Vérifie que c\'est une chaîne de caractères
    status?: string;

    @ApiProperty({
        description: 'L\'ID de l\'utilisateur associé à l\'activité',
        type: Number,
        example: 1,
    })
    @IsNumber()  // Vérifie que la valeur est un entier
    @Min(1)  // L\'ID doit être supérieur ou égal à 1
    userId: number;


    @ApiPropertyOptional({
        description: 'Les SousActivité',
        type: [ UpdateSousActivityDto],
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @IsArray()
    @Type(() =>  UpdateSousActivityDto)
    subactivities: UpdateSousActivityDto[]

}

