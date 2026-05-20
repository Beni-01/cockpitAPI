import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SatviMission } from './satvi-mission.entity';

export enum SatviInvitationStatus {
  PREPAREE = 'preparee',
  ENVOYEE = 'envoyee',
  ECHEC = 'echec',
  UTILISEE = 'utilisee',
}

@Entity({ name: 'satvi_mission_invitation' })
@Index('IDX_satvi_invitation_mission', ['missionId'])
@Index('IDX_satvi_invitation_user', ['userId'])
@Index('IDX_satvi_invitation_token', ['token'], { unique: true })
export class SatviMissionInvitation {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de l invitation', example: 1 })
  id: number;

  @Column({ name: 'mission_id', type: 'int' })
  @ApiProperty({ description: 'ID de la mission SatVi', example: 1 })
  missionId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Agent interne invite' })
  userId: number;

  @Column({ name: 'nom_complet', type: 'varchar', length: 220 })
  @ApiProperty({ description: 'Nom du missionnaire invite', example: 'Mike Kisolo Dimelo' })
  nomComplet: string;

  @Column({ name: 'email', type: 'varchar', length: 180, nullable: true })
  @ApiPropertyOptional({ description: 'Email du missionnaire invite' })
  email: string;

  @Column({ name: 'direction', type: 'varchar', length: 180, nullable: true })
  @ApiPropertyOptional({ description: 'Direction/service du missionnaire invite' })
  direction: string;

  @Column({ name: 'token', type: 'varchar', length: 120, unique: true })
  @ApiProperty({ description: 'Token unique du lien anonyme' })
  token: string;

  @Column({ name: 'invitation_link', type: 'varchar', length: 500 })
  @ApiProperty({ description: 'Lien unique envoye au missionnaire' })
  invitationLink: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 30,
    default: SatviInvitationStatus.PREPAREE,
  })
  @ApiProperty({ description: 'Statut d envoi de l invitation', enum: SatviInvitationStatus })
  status: SatviInvitationStatus;

  @Column({ name: 'sent_at', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Date d envoi de l invitation' })
  sentAt: Date;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Date d utilisation definitive du token' })
  usedAt: Date;

  @Column({ name: 'send_error', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Message d erreur en cas d echec d envoi' })
  sendError: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Date de creation de l invitation' })
  createdAt: Date;

  @ManyToOne(() => SatviMission, (mission) => mission.invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mission_id' })
  mission: SatviMission;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
