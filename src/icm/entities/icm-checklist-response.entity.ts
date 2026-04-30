import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IcmChecklist } from './icm-checklist.entity';
import { IcmQuestion } from './icm-question.entity';
import { ConformityLevel } from '../enums';

@Entity({ name: 'icm_checklist_response' })
export class IcmChecklistResponse {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de la réponse', example: 1 })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'ID de la checklist' })
  checklistId: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'ID de la question ICM' })
  questionId: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({
    description: 'Indique si la tâche a été réalisée',
    example: false,
  })
  realised: boolean;

  @Column({
    type: 'enum',
    enum: ConformityLevel,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Niveau de conformité',
    enum: ConformityLevel,
    example: ConformityLevel.CONFORME,
  })
  conformityLevel: ConformityLevel;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({
    description: 'Commentaire sur la réponse',
    example: 'Tous les entretiens ont été réalisés sans problème',
  })
  comment: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({
    description: 'Preuve fournie (texte ou URL)',
    example: 'https://bucket.s3.com/entretien-avril-2026.pdf',
  })
  proofProvided: string;

  @Column({ type: 'float', nullable: true })
  @ApiPropertyOptional({
    description: 'Score de l\'item (0, 0.5 ou 1)',
    example: 1,
  })
  scoreItem: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;

  @ManyToOne(() => IcmChecklist, (checklist) => checklist.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'checklistId' })
  checklist: IcmChecklist;

  @ManyToOne(() => IcmQuestion, (question) => question.responses, {
    eager: true,
  })
  @JoinColumn({ name: 'questionId' })
  question: IcmQuestion;
}
