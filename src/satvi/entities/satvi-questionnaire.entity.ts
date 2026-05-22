import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SatviMission } from './satvi-mission.entity';



export enum SatviStatus {
  BROUILLON = 'brouillon',
  SOUMIS = 'soumis',
  ARCHIVE = 'archive',
}

export interface SatviEvaluation {
  qualiteAccueil: number;
  dispositionsLogistiques: number;
  disponibiliteEquipeCoordination: number;
  aspectAccueilAmeliorer?: string;
  organisationGenerale: number;
  missionPrepareeCoordonnee: number;
  contraintesPrisesEnCharge: number;
  difficulteOrganisationnelle?: string;
  collaborationAgentsProvinciaux: number;
  implicationEquipesLocales: number;
  reactiviteEquipesLocales: number;
  ameliorationCollaborationTerrain?: string;
  professionnalismeCoordination: number;
  echangesFluidesRespectueux: number;
  dysfonctionnementMajeur?: boolean;
  appreciationGlobale?: number;
  pertinenceAppuiCoordination: number;
  recommandationModeleBonnePratique: number;
  recommandationCoordinationBonExemple: number;
}

@Entity({ name: 'satvi_questionnaire' })
@Index('IDX_satvi_reference_code', ['referenceCode'], { unique: true })
@Index('IDX_satvi_province_visitee', ['provinceVisitee'])
@Index('IDX_satvi_direction_metier', ['directionMetier'])
@Index('IDX_satvi_type_mission', ['typeMission'])
@Index('IDX_satvi_status', ['status'])
@Index('IDX_satvi_periode', ['periodeDu', 'periodeAu'])
@Index('IDX_satvi_dysfonctionnement', ['dysfonctionnementMajeur'])
@Index('IDX_satvi_questionnaire_mission', ['missionId'])
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

  @Column({ name: 'mission_id', type: 'int', nullable: true })
  @ApiPropertyOptional({
    description: 'Mission SatVi rattachee. La reponse reste anonyme.',
    example: 1,
  })
  missionId: number;

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
    type: 'varchar',
    length: 50,
  })
  @ApiProperty({
    description: 'Type de mission',
    example: 'Mission de suivi',
  
  })
  typeMission: string;

  @Column({ name: 'type_mission_autre', type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({
    description: 'Precision lorsque le type de mission vaut autre',
    example: 'Mission mixte',
  })
  typeMissionAutre: string;

  @Column({ name: 'evaluation', type: 'json' })
  @ApiProperty({
    description: 'Objet regroupant les 19 questions du questionnaire SatVi',
    type: 'object',
    additionalProperties: true,
  })
  evaluation: SatviEvaluation;

  @Column({ name: 'question_count', type: 'int', default: 19 })
  @ApiProperty({ description: 'Nombre total de questions SatVi', example: 19 })
  questionCount: number;

  @Column({ name: 'evaluation_total', type: 'int', default: 0 })
  @ApiProperty({ description: 'Somme des notes de la section evaluation', example: 63 })
  evaluationTotal: number;

  @Column({ name: 'evaluation_count', type: 'int', default: 14 })
  @ApiProperty({
    description: 'Nombre de questions notees utilisees dans la moyenne',
    example: 14,
  })
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
  @ApiProperty({
    description: 'Niveau global de satisfaction concernant la mission',
    example: 5,
  })
  appreciationGlobale: number;

  @Column({ name: 'score_global', type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Score global moyen incluant evaluation et appreciation', example: 4.25 })
  scoreGlobal: number;

  @Column({ name: 'points_forts', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Points forts de la coordination' })
  pointsForts: string;

  @Column({ name: 'aspect_accueil_ameliorer', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: "Aspect de l'accueil a ameliorer" })
  aspectAccueilAmeliorer: string;

  @Column({ name: 'difficulte_organisationnelle', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Difficulte organisationnelle rencontree' })
  difficulteOrganisationnelle: string;

  @Column({
    name: 'amelioration_collaboration_terrain',
    type: 'text',
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Amelioration proposee pour renforcer la collaboration terrain',
  })
  ameliorationCollaborationTerrain: string;

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
    type: 'varchar',
    length: 30,
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

  @ManyToOne(() => SatviMission, { eager: false })
  @JoinColumn({ name: 'mission_id' })
  mission: SatviMission;
}
