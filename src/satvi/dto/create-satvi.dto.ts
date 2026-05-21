import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SatviStatus, SatviTypeMission } from '../entities/satvi-questionnaire.entity';

export class SatviEvaluationDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  qualiteAccueil: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  dispositionsLogistiques: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  disponibiliteEquipeCoordination: number;

  @ApiPropertyOptional({ description: "Aspect de l'accueil a ameliorer" })
  @IsString()
  @IsOptional()
  aspectAccueilAmeliorer?: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  organisationGenerale: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  missionPrepareeCoordonnee: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  contraintesPrisesEnCharge: number;

  @ApiPropertyOptional({ description: 'Difficulte organisationnelle rencontree' })
  @IsString()
  @IsOptional()
  difficulteOrganisationnelle?: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  collaborationAgentsProvinciaux: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  implicationEquipesLocales: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  reactiviteEquipesLocales: number;

  @ApiPropertyOptional({
    description: 'Amelioration proposee pour renforcer la collaboration terrain',
  })
  @IsString()
  @IsOptional()
  ameliorationCollaborationTerrain?: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  professionnalismeCoordination: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  echangesFluidesRespectueux: number;

  @ApiPropertyOptional({
    description: 'Dysfonctionnement majeur signale',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  dysfonctionnementMajeur?: boolean;

  @ApiPropertyOptional({
    description: 'Niveau global de satisfaction concernant cette mission',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  appreciationGlobale?: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  pertinenceAppuiCoordination: number;

  @ApiProperty({ example: 5, enum: [1, 3, 5] })
  @IsInt()
  @IsIn([1, 3, 5])
  recommandationModeleBonnePratique: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  recommandationCoordinationBonExemple: number;
}

export class CreateSatviDto {
  @ApiPropertyOptional({
    description: 'Mission SatVi rattachee. Aucun agent repondant n est enregistre.',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  missionId?: number;

  @ApiProperty({
    description: 'Direction metier qui a realise ou concerne la mission',
    example: 'Direction des coordinations',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  directionMetier: string;

  @ApiProperty({
    description: 'Province visitee',
    example: 'Kinshasa',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  provinceVisitee: string;

  @ApiProperty({ description: 'Date de debut de la mission', example: '2026-05-01' })
  @IsDateString()
  @IsNotEmpty()
  periodeDu: string;

  @ApiProperty({ description: 'Date de fin de la mission', example: '2026-05-05' })
  @IsDateString()
  @IsNotEmpty()
  periodeAu: string;

  @ApiProperty({
    description: 'Type de mission',
    enum: SatviTypeMission,
    example: SatviTypeMission.APPUI_TECHNIQUE,
  })
  @IsEnum(SatviTypeMission)
  @IsNotEmpty()
  typeMission: SatviTypeMission;

  @ApiPropertyOptional({
    description: 'Precision si le type de mission vaut autre',
    example: 'Mission mixte',
    maxLength: 150,
  })
  @ValidateIf((dto) => dto.typeMission === SatviTypeMission.AUTRE)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  typeMissionAutre?: string;

  @ApiProperty({ type: SatviEvaluationDto })
  @ValidateNested()
  @Type(() => SatviEvaluationDto)
  evaluation: SatviEvaluationDto;

  @ApiPropertyOptional({
    description: 'Niveau global de satisfaction concernant cette mission',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  appreciationGlobale?: number;

  @ApiPropertyOptional({ description: 'Points forts observes' })
  @IsString()
  @IsOptional()
  pointsForts?: string;

  @ApiPropertyOptional({ description: "Aspect de l'accueil a ameliorer" })
  @IsString()
  @IsOptional()
  aspectAccueilAmeliorer?: string;

  @ApiPropertyOptional({ description: 'Difficulte organisationnelle rencontree' })
  @IsString()
  @IsOptional()
  difficulteOrganisationnelle?: string;

  @ApiPropertyOptional({
    description: 'Amelioration proposee pour renforcer la collaboration terrain',
  })
  @IsString()
  @IsOptional()
  ameliorationCollaborationTerrain?: string;

  @ApiPropertyOptional({ description: 'Faiblesses observees' })
  @IsString()
  @IsOptional()
  faiblessesObservees?: string;

  @ApiPropertyOptional({ description: 'Recommandations du visiteur' })
  @IsString()
  @IsOptional()
  recommandations?: string;

  @ApiPropertyOptional({
    description: 'Dysfonctionnement majeur signale',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  dysfonctionnementMajeur?: boolean;

  @ApiPropertyOptional({ description: 'Description du dysfonctionnement signale' })
  @ValidateIf((dto) => dto.dysfonctionnementMajeur === true)
  @IsString()
  @IsNotEmpty()
  descriptionDysfonctionnement?: string;

  @ApiPropertyOptional({
    description: 'Statut initial du questionnaire',
    enum: SatviStatus,
    default: SatviStatus.SOUMIS,
  })
  @IsEnum(SatviStatus)
  @IsOptional()
  status?: SatviStatus;

  @ApiPropertyOptional({ description: 'Adresse IP optionnelle', maxLength: 80 })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User-agent optionnel', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  userAgent?: string;
}
