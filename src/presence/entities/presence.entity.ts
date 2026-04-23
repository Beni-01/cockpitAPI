import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum PresenceStatus {
  PRESENT = 'Présent',
  ABSENT = 'Absent',
  RETARD = 'En retard',
  DEMI_JOURNEE = 'Demi-journée',
}

@Entity({ name: 'presence' })
export class Presence extends Timestamp {
  @ApiProperty({ description: 'ID unique du pointage', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID de l\'utilisateur', example: 1 })
  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ description: 'Date du pointage', example: '2026-04-22' })
  @Column({ type: 'date' })
  date: string;

  @ApiPropertyOptional({ description: 'Heure d\'arrivée', example: '2026-04-22T08:00:00Z' })
  @Column({ type: 'datetime', nullable: true })
  checkInTime: Date;

  @ApiPropertyOptional({ description: 'Heure de départ', example: '2026-04-22T17:00:00Z' })
  @Column({ type: 'datetime', nullable: true })
  checkOutTime: Date;

  // ── Géolocalisation ───────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Latitude à l\'arrivée', example: -4.32142 })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  checkInLatitude: number;

  @ApiPropertyOptional({ description: 'Longitude à l\'arrivée', example: 15.31257 })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  checkInLongitude: number;

  @ApiPropertyOptional({ description: 'Latitude au départ', example: -4.32145 })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  checkOutLatitude: number;

  @ApiPropertyOptional({ description: 'Longitude au départ', example: 15.31259 })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  checkOutLongitude: number;

  // ── Analyse ───────────────────────────────────────────────────────────────

  @ApiProperty({ enum: PresenceStatus, default: PresenceStatus.PRESENT })
  @Column({
    type: 'enum',
    enum: PresenceStatus,
    default: PresenceStatus.PRESENT,
  })
  status: PresenceStatus;

  @ApiProperty({ description: 'Indique si l\'agent est arrivé en retard', default: false })
  @Column({ type: 'boolean', default: false })
  isLate: boolean;

  @ApiProperty({ description: 'Nombre de minutes de retard', default: 0 })
  @Column({ type: 'int', default: 0 })
  delayMinutes: number;

  @ApiPropertyOptional({ description: 'Informations sur l\'appareil utilisé', example: 'iPhone 13, iOS 15.4' })
  @Column({ type: 'varchar', nullable: true })
  deviceInfo: string;

  @ApiPropertyOptional({ description: 'Commentaire ou motif (ex: pour retard/absence)', example: 'Embouteillages' })
  @Column({ type: 'text', nullable: true })
  commentaire: string;
}
