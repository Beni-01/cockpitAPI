import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { IcmChecklistResponse } from './icm-checklist-response.entity';
import { IcmCategory, IcmPeriodicity } from '../enums';

@Entity({ name: 'icm_question' })
export class IcmQuestion extends Timestamp {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de la question ICM', example: 1 })
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  @ApiProperty({
    description: 'Libellé de la tâche/question ICM',
    example: 'Entretiens mensuels individuels réalisés',
  })
  label: string;

  @Column({
    type: 'enum',
    enum: IcmCategory,
    nullable: false,
  })
  @ApiProperty({
    description: 'Catégorie ICM',
    enum: IcmCategory,
    example: IcmCategory.RH,
  })
  category: IcmCategory;

  @Column({
    type: 'enum',
    enum: IcmPeriodicity,
    nullable: false,
  })
  @ApiProperty({
    description: 'Périodicité de la tâche',
    enum: IcmPeriodicity,
    example: IcmPeriodicity.MENSUEL,
  })
  periodicity: IcmPeriodicity;

  @Column({ type: 'text', nullable: false })
  @ApiProperty({
    description: 'Preuve attendue pour la conformité',
    example: 'Fiche d\'entretien signée par les agents et le coordonnateur',
  })
  expectedProof: string;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({
    description: 'Ordre d\'affichage dans la checklist',
    example: 1,
  })
  order: number;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({
    description: 'Statut actif/inactif de la question',
    example: true,
  })
  isActive: boolean;

  @OneToMany(() => IcmChecklistResponse, (response) => response.question)
  responses: IcmChecklistResponse[];
}
