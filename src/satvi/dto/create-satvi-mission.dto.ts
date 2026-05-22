import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SatviTypeMission } from '../entities';
import { CreateSatviDto } from './create-satvi.dto';

export class CreateSatviMissionDto {
  @ApiProperty({
    description: 'Titre de la mission',
    example: 'Mission de suivi Nord-Kivu',
    maxLength: 180,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  titre: string;

  @ApiPropertyOptional({
    description: 'Objectifs ou description de la mission',
    example: 'Evaluer la coordination provinciale apres la mission de suivi.',
  })
  @IsString()
  @IsOptional()
  description?: string;


  @ApiPropertyOptional({
    description: 'Direction',
    example: 'Direction de la coordination provinciale',
  })
  @IsString()
  @IsOptional()
  direction?: string;

  @ApiProperty({ description: 'Date de debut', example: '2026-04-05' })
  @IsDateString()
  dateDebut: string;

  @ApiProperty({ description: 'Date de fin', example: '2026-04-08' })
  @IsDateString()
  dateFin: string;

  @ApiProperty({ description: 'ID de la coordination cible', example: 1 })
  @Type(() => Number)
  @IsInt()
  coordinationId: number;

  @ApiProperty({ description: 'Type de mission', enum: SatviTypeMission })
  @IsEnum(SatviTypeMission)
  typeMission: SatviTypeMission;

  @ApiPropertyOptional({ description: 'Precision si le type vaut autre' })
  @ValidateIf((dto) => dto.typeMission === SatviTypeMission.AUTRE)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  typeMissionAutre?: string;

  @ApiProperty({
    description: 'IDs des agents missionnaires qui recevront chacun un lien unique',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  missionnaireIds: number[];

  @ApiPropertyOptional({
    description: 'URL front-end de base utilisee pour construire les liens anonymes',
    example: 'https://cockpit.fonarev.cd/satvi/questionnaire',
  })
  @IsString()
  @IsOptional()
  publicBaseUrl?: string;
}

export class SubmitSatviMissionQuestionnaireDto extends PickType(CreateSatviDto, [
  'evaluation',
  'appreciationGlobale',
  'pointsForts',
  'aspectAccueilAmeliorer',
  'difficulteOrganisationnelle',
  'ameliorationCollaborationTerrain',
  'faiblessesObservees',
  'recommandations',
  'dysfonctionnementMajeur',
  'descriptionDysfonctionnement',
  'status',
] as const) {}
