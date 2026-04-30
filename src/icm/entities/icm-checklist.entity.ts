import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { User } from 'src/user/entities/user.entity';
import { IcmChecklistResponse } from './icm-checklist-response.entity';
import { ChecklistStatus } from '../enums';

@Entity({ name: 'icm_checklist' })
@Index(['coordinationId', 'month', 'year'], { unique: true, where: `"deletedAt" IS NULL` })
export class IcmChecklist extends Timestamp {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de la checklist ICM', example: 1 })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'ID de la coordination', example: 1 })
  coordinationId: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'Mois (1-12)', example: 4 })
  month: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'Année', example: 2026 })
  year: number;

  @Column({
    type: 'enum',
    enum: ChecklistStatus,
    default: ChecklistStatus.BROUILLON,
  })
  @ApiProperty({
    description: 'Statut de la checklist',
    enum: ChecklistStatus,
    example: ChecklistStatus.BROUILLON,
  })
  status: ChecklistStatus;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({
    description: 'Score ICM en pourcentage (0-100)',
    example: 85.5,
  })
  scoreICM: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'ID de l\'utilisateur qui a créé la checklist' })
  createdBy: number;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ description: 'Date de soumission' })
  submittedAt: Date;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ description: 'ID de l\'utilisateur validateur' })
  validatedBy: number;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ description: 'Date de validation' })
  validatedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @ApiProperty({ description: 'Motif du rejet' })
  rejectionReason: string;

  @ManyToOne(() => Coordination, { eager: false })
  @JoinColumn({ name: 'coordinationId' })
  coordination: Coordination;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'validatedBy' })
  validator: User;

  @OneToMany(() => IcmChecklistResponse, (response) => response.checklist, {
    cascade: true,
  })
  responses: IcmChecklistResponse[];
}
