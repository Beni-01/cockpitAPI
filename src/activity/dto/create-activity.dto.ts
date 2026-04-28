import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDateString, IsInt, Min, Max, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { CreateSousActivityDto } from 'src/sous-activity/dto/create-sous-activity.dto';

export class CreateActivityDto {
    @ApiProperty({
        description: 'Le titre de l\'activité',
        type: String,
        example: 'Réunion de travail',
    })
    @IsString()
    @IsNotEmpty()
    titre: string;

    @ApiPropertyOptional({
        description: 'La description de l\'activité',
        type: String,
        example: 'Réunion pour discuter des projets futurs',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'La date de début de l\'activité',
        type: String,
        format: 'date',
        example: '2024-11-20',
    })
    @IsOptional()
    @IsDateString()
    dateDebut?: string;

    @ApiPropertyOptional({
        description: 'La date de fin de l\'activité',
        type: String,
        format: 'date',
        example: '2024-11-22',
    })
    @IsOptional()
    @IsDateString()
    dateFin?: string;

    @ApiPropertyOptional({ description: 'Taux de deadline' })
    @IsOptional() 
    @IsNumber()
    deadlineRate?: number;

    @ApiPropertyOptional({ description: 'Nombre de ressources' })
    @IsOptional() 
    @IsNumber()
    nbre_ressource?: number;

    @ApiPropertyOptional({
        description: 'Le statut de l\'activité',
        type: String,
        example: 'En cours',
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({
        description: 'L\'etat de l\'activité',
        type: String,
        example: 'En cours',
    })
    @IsOptional()
    @IsString()
    etat?: string;

    @ApiPropertyOptional({
        description: 'direction',
        type: String,
        example: 'Finances',
    })
    @IsOptional()
    @IsString() 
    direction?: string;

    // Budget alloué rendu optionnel
    @ApiPropertyOptional({ description: 'Budget alloué à l\'activité', example: 10000 })
    @IsOptional()
    @IsNumber()
    budget?: number;
  
    @ApiPropertyOptional({ description: 'Livrable attendu', example: 'Rapport final' })
    @IsOptional()
    @IsString()
    livrable?: string;

    @ApiPropertyOptional({ description: 'Type de Livrable attendu', example: 'Document' })
    @IsOptional()
    @IsString()
    typelivrable?: string;

    @ApiPropertyOptional({ description: 'Coordination responsable', example: 'Coordination Nord-Kivu' })
    @IsOptional()
    @IsString()
    coordination?: string;

    @ApiPropertyOptional({ description: 'Lieu d\'exécution de l\'activité', example: 'Goma' })
    @IsOptional()
    @IsString()
    lieuExecution?: string;

    @ApiProperty({
        description: 'L\'ID de l\'utilisateur associé à l\'activité',
        type: Number,
        example: 1,
    })
    @IsNumber()
    @Min(1)
    userId: number;

    @ApiPropertyOptional({
        description: 'Les Sous-activités associées',
        type: [CreateSousActivityDto],
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => CreateSousActivityDto)
    subactivities?: CreateSousActivityDto[];

    @ApiPropertyOptional({ description: 'Date fin réelle activité' })
    @IsOptional()
    @IsString()
    dateFinReel?: string;
  
    @ApiPropertyOptional({ description: 'Résultats obtenus' })
    @IsOptional()
    @IsString()
    resultatObtenu?: string;
  
    // Budget consommé rendu optionnel
    @ApiPropertyOptional({ description: 'Budget consommé activité', example: 5000 })
    @IsOptional()
    @IsNumber()
    budgetConsomme?: number;

    @ApiPropertyOptional({ description: 'Résultat activité', example: 'Objectifs atteints' })
    @IsOptional()
    @IsString()
    resultat?: string;
  
    @ApiPropertyOptional({ description: 'Province activité', example: 'Kinshasa' })
    @IsOptional()
    @IsString()
    province?: string;
  
    @ApiPropertyOptional({ description: 'Responsable activité', example: 'John Doe' })
    @IsOptional()
    @IsString()
    responsable?: string;
}
