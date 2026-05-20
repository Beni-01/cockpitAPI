import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SatviTypeMission {
  SUIVI = 'suivi',
  APPUI_TECHNIQUE = 'appui_technique',
  CONTROLE = 'controle',
  AUTRE = 'autre',
}

export enum SatviStatus {
  BROUILLON = 'brouillon',
  SOUMIS = 'soumis',
  ARCHIVE = 'archive',
}

export interface SatviEvaluation {
  arriveePreparee: number;
  programmeDisponible: number;
  activitesBienOrganisees: number;
  agentsDisponibles: number;
  interlocuteursAccessibles: number;
  equipeMobilisee: number;
  informationsFiables: number;
  documentsComplets: number;
  appuiTechniqueUtile: number;
  reponseRapideDemandes: number;
  difficultesPrisesEnCharge: number;
  adaptationContraintes: number;
  communicationClaire: number;
  feedbackDisponible: number;
  suiviPostMissionAssure: number;
}

@Entity({ name: 'satvi_questionnaire' })
@Index('IDX_satvi_reference_code', ['referenceCode'], { unique: true })
@Index('IDX_satvi_province_visitee', ['provinceVisitee'])
@Index('IDX_satvi_direction_metier', ['directionMetier'])
@Index('IDX_satvi_type_mission', ['typeMission'])
@Index('IDX_satvi_status', ['status'])
@Index('IDX_satvi_periode', ['periodeDu', 'periodeAu'])
@Index('IDX_satvi_dysfonctionnement', ['dysfonctionnementMajeur'])
export class SatviQuestionnaire extends Timestamp {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique du questionnaire SatVi', example: 1 })
  id: number;

  @Column({
    name: 'reference_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Reference publique du questionnaire',
    example: 'SATVI-20260519-8K4P2A',
  })
  referenceCode: string;

  @Column({ name: 'direction_metier', type: 'varchar', length: 150 })
  @ApiProperty({
    description: 'Direction metier concernee',
    example: 'Direction des coordinations',
  })
  directionMetier: string;

  @Column({ name: 'province_visitee', type: 'varchar', length: 150 })
  @ApiProperty({ description: 'Province visitee', example: 'Kinshasa' })
  provinceVisitee: string;

  @Column({ name: 'periode_du', type: 'date' })
  @ApiProperty({ description: 'Date de debut de la mission', example: '2026-05-01' })
  periodeDu: string;

  @Column({ name: 'periode_au', type: 'date' })
  @ApiProperty({ description: 'Date de fin de la mission', example: '2026-05-05' })
  periodeAu: string;

  @Column({
    name: 'type_mission',
    type: 'enum',
    enum: SatviTypeMission,
  })
  @ApiProperty({
    description: 'Type de mission',
    enum: SatviTypeMission,
    example: SatviTypeMission.APPUI_TECHNIQUE,
  })
  typeMission: SatviTypeMission;

  @Column({ name: 'type_mission_autre', type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({
    description: 'Precision lorsque le type de mission vaut autre',
    example: 'Mission mixte',
  })
  typeMissionAutre: string;

  @Column({ name: 'evaluation', type: 'json' })
  @ApiProperty({
    description: 'Reponses numeriques de la section evaluation (15 notes de 1 a 5)',
    type: 'object',
    additionalProperties: true,
  })
  evaluation: SatviEvaluation;

  @Column({ name: 'evaluation_total', type: 'int', default: 0 })
  @ApiProperty({ description: 'Somme des notes de la section evaluation', example: 63 })
  evaluationTotal: number;

  @Column({ name: 'evaluation_count', type: 'int', default: 15 })
  @ApiProperty({ description: 'Nombre de questions notees', example: 15 })
  evaluationCount: number;

  @Column({
    name: 'evaluation_average',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  @ApiProperty({ description: 'Moyenne des notes de la section evaluation', example: 4.2 })
  evaluationAverage: number;

  @Column({ name: 'appreciation_globale', type: 'tinyint' })
  @ApiProperty({ description: 'Appreciation globale de 1 a 5', example: 5 })
  appreciationGlobale: number;

  @Column({ name: 'score_global', type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Score global moyen incluant evaluation et appreciation', example: 4.25 })
  scoreGlobal: number;

  @Column({ name: 'points_forts', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Points forts de la coordination' })
  pointsForts: string;

  @Column({ name: 'faiblesses_observees', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Faiblesses observees' })
  faiblessesObservees: string;

  @Column({ name: 'recommandations', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Recommandations du visiteur' })
  recommandations: string;

  @Column({ name: 'dysfonctionnement_majeur', type: 'boolean', default: false })
  @ApiProperty({
    description: 'Indique si un dysfonctionnement majeur a ete signale',
    example: false,
  })
  dysfonctionnementMajeur: boolean;

  @Column({ name: 'description_dysfonctionnement', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Description du dysfonctionnement majeur' })
  descriptionDysfonctionnement: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SatviStatus,
    default: SatviStatus.SOUMIS,
  })
  @ApiProperty({
    description: 'Statut du questionnaire',
    enum: SatviStatus,
    example: SatviStatus.SOUMIS,
  })
  status: SatviStatus;

  @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Date de soumission' })
  submittedAt: Date;

  @Column({ name: 'ip_address', type: 'varchar', length: 80, nullable: true })
  @ApiPropertyOptional({ description: 'Adresse IP optionnelle du visiteur anonyme' })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  @ApiPropertyOptional({ description: 'User-agent optionnel du visiteur anonyme' })
  userAgent: string;
}
