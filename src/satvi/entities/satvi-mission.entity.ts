import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SatviQuestionnaire, SatviTypeMission } from './satvi-questionnaire.entity';
import { SatviMissionInvitation } from './satvi-mission-invitation.entity';

export enum SatviMissionStatus {
  BROUILLON = 'brouillon',
  ACTIVE = 'active',
  CLOTUREE = 'cloturee',
  ARCHIVEE = 'archivee',
}

@Entity({ name: 'satvi_mission' })
@Index('IDX_satvi_mission_coordination', ['coordinationId'])
@Index('IDX_satvi_mission_status', ['status'])
@Index('IDX_satvi_mission_dates', ['dateDebut', 'dateFin'])
@Index('IDX_satvi_mission_type', ['typeMission'])
export class SatviMission extends Timestamp {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de la mission SatVi', example: 1 })
  id: number;

  @Column({ name: 'reference_code', type: 'varchar', length: 50, unique: true })
  @ApiProperty({ description: 'Reference unique de la mission', example: 'SATVI-M-20260520-AB12CD' })
  referenceCode: string;

  @Column({ name: 'titre', type: 'varchar', length: 180 })
  @ApiProperty({ description: 'Titre de la mission', example: 'Mission de suivi Nord-Kivu' })
  titre: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Description ou objectifs de la mission' })
  description: string;

  @Column({ name: 'date_debut', type: 'date' })
  @ApiProperty({ description: 'Date de debut', example: '2026-04-05' })
  dateDebut: string;

  @Column({ name: 'date_fin', type: 'date' })
  @ApiProperty({ description: 'Date de fin', example: '2026-04-08' })
  dateFin: string;

  @Column({ name: 'coordination_id', type: 'int' })
  @ApiProperty({ description: 'Coordination cible', example: 1 })
  coordinationId: number;

  @Column({ name: 'province', type: 'varchar', length: 150 })
  @ApiProperty({ description: 'Province de la coordination cible', example: 'Nord-Kivu' })
  province: string;

  @Column({ name: 'coordination_nom', type: 'varchar', length: 180 })
  @ApiProperty({ description: 'Nom de la coordination cible', example: 'Coordination de Nord-Kivu' })
  coordinationNom: string;

  @Column({
    name: 'type_mission',
    type: 'varchar',
    length: 50,
  })
  @ApiProperty({ description: 'Type de mission', enum: SatviTypeMission })
  typeMission: SatviTypeMission;

  @Column({ name: 'type_mission_autre', type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Precision si le type vaut autre' })
  typeMissionAutre: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 30,
    default: SatviMissionStatus.ACTIVE,
  })
  @ApiProperty({ description: 'Statut de la mission', enum: SatviMissionStatus })
  status: SatviMissionStatus;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Utilisateur interne qui a cree la mission' })
  createdBy: number;

  @Column({ name: 'sent_at', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Date d envoi des invitations' })
  sentAt: Date;

  @ManyToOne(() => Coordination, { eager: false })
  @JoinColumn({ name: 'coordination_id' })
  coordination: Coordination;

  @OneToMany(() => SatviMissionInvitation, (invitation) => invitation.mission, {
    cascade: true,
  })
  invitations: SatviMissionInvitation[];

  @OneToMany(() => SatviQuestionnaire, (questionnaire) => questionnaire.mission)
  questionnaires: SatviQuestionnaire[];
}
