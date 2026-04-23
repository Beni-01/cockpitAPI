import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum AntenneStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive/Suspendue',
}

@Entity({ name: 'antenne' })
export class Antenne extends Timestamp {
  @ApiProperty({ description: 'ID unique de l\'antenne', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nom de l\'antenne', example: 'Antenne Lubumbashi Centre' })
  @Column({ type: 'varchar', nullable: false })
  nom: string;

  @ApiProperty({ description: 'Code de l\'antenne', example: 'ANT-HK-01' })
  @Column({ type: 'varchar', nullable: true })
  code: string;

  @ApiProperty({ description: 'Adresse de l\'antenne', example: 'Avenue Lumumba, n°123, Lubumbashi' })
  @Column({ type: 'varchar', nullable: true })
  adresse: string;

  @ApiProperty({ description: 'Nom du responsable', example: 'Jean Kabongo' })
  @Column({ type: 'varchar', nullable: true })
  responsable: string;

  @ApiProperty({
    description: 'Statut de l\'antenne',
    enum: AntenneStatus,
    default: AntenneStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: AntenneStatus,
    default: AntenneStatus.ACTIVE,
  })
  status: AntenneStatus;

  @ApiProperty({ description: 'ID de la coordination parente' })
  @Column({ type: 'int', nullable: false })
  coordinationId: number;

  @ManyToOne(() => Coordination, (coordination) => coordination.antennes, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'Coordination provinciale de rattachement' })
  coordination: Coordination;

  // Note: Le nombre d'agents peut être calculé dynamiquement ou stocké si besoin
  @ApiPropertyOptional({ description: 'Nombre d\'agents rattachés', example: 2 })
  @Column({ type: 'int', default: 0 })
  nombreAgents: number;
}
