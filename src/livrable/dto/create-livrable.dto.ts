import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsDateString } from "class-validator";

export class CreateLivrableDto {
    @ApiProperty({
        description: 'Nom du livrable',
        example: 'Rapport annuel',
      })
      @IsString()
      livrable: string;
    
      @ApiPropertyOptional({
        description: 'Description du livrable',
        example: 'Rapport sur les activités annuelles.',
      })
      @IsOptional()
      @IsString()
      description?: string;
    
      @ApiPropertyOptional({
        description: 'Statut du livrable',
        example: 'En cours',
        default: 'En attente',
      })
      @IsOptional()
      @IsString()
      status?: string;
    
      @ApiPropertyOptional({
        description: 'Responsable du livrable',
        example: 'Jean Dupont',
      })
      @IsOptional()
      @IsString()
      responsable?: string;
    
      @ApiPropertyOptional({
        description: 'Date prévue de livraison',
        example: '2024-12-31',
      })
      @IsOptional()
      @IsDateString()
      dateLivraisonAttendue?: string;
    
      @ApiPropertyOptional({
        description: 'Date réelle de livraison',
        example: '2024-12-25',
      })
      @IsOptional()
      @IsDateString()
      dateLivraisonReelle?: string;
    
      @ApiPropertyOptional({
        description: 'Type du livrable',
        example: 'PDF',
      })
      @IsOptional()
      @IsString()
      typelivrable?: string;

      @ApiPropertyOptional({
        description: 'Support du livrable',
        example: 'PDF',
      })
      @IsOptional()
      @IsString()
      support?: string;

      @ApiPropertyOptional({
        description: 'Nom du fichier du livrable du livrable',
        example: 'Rapport trimestriel',
      })
      @IsOptional()
      @IsString()
      livrablefileName:string
    
      @ApiPropertyOptional({
        description: 'Date prévue de validation',
        example: '2025-01-05',
      })
      @IsOptional()
      @IsDateString()
      dateValidationAttendue?: string;
    
      @ApiPropertyOptional({
        description: 'Date réelle de validation',
        example: '2025-01-03',
      })
      @IsOptional()
      @IsDateString()
      dateValidationReel?: string;
    
      @ApiPropertyOptional({
        description: 'Commentaires sur le livrable',
        example: 'Livraison effectuée en avance.',
      })
      @IsOptional()
      @IsString()
      commentaire?: string;
}
