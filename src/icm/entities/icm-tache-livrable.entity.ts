import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { User } from 'src/user/entities/user.entity';
import { IcmTacheLivrableStatus } from '../enums';
import { IcmTache } from './icm-tache.entity';

@Entity({ name: 'icm_tache_livrable' })
@Index(['tacheId', 'coordinationId'], { unique: true })
@Index(['status'])
export class IcmTacheLivrable extends Timestamp {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID du livrable ICM', example: 1 })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'ID de la tâche ICM', example: 1 })
  tacheId: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'ID de la coordination', example: 1 })
  coordinationId: number;

  @Column({
    type: 'enum',
    enum: IcmTacheLivrableStatus,
    default: IcmTacheLivrableStatus.SOUMIS,
  })
  @ApiProperty({
    description: 'Statut du livrable',
    enum: IcmTacheLivrableStatus,
  })
  status: IcmTacheLivrableStatus;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @ApiProperty({ description: 'Nom du fichier ou du livrable transmis' })
  nomFichier: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  @ApiProperty({ description: 'URL ou chemin du fichier transmis' })
  urlFichier: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Commentaire du soumissionnaire' })
  commentaire: string;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Utilisateur ayant soumis le livrable' })
  soumisPar: number;

  @Column({ type: 'datetime', nullable: false })
  @ApiProperty({ description: 'Date de soumission' })
  soumisLe: Date;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Utilisateur ayant traité le livrable' })
  traitePar: number;

  @Column({ type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Date de validation ou de retour' })
  traiteLe: Date;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Motif du retour' })
  motifRetour: string;

  @ManyToOne(() => IcmTache, (tache) => tache.livrables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tacheId' })
  tache: IcmTache;

  @ManyToOne(() => Coordination, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coordinationId' })
  coordination: Coordination;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'soumisPar' })
  soumissionnaire: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'traitePar' })
  validateur: User;
}
