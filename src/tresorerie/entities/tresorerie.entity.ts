import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

export enum TypeMouvement {
  ENTREE = 'entree',
  SORTIE = 'sortie',
}

@Entity({ name: 'tresorerie_mouvement' })
@Index(['coordination'])
@Index(['dateOperation'])
@Index(['typeMouvement'])
export class TresorerieMouvement extends Timestamp {
  @PrimaryGeneratedColumn({
    comment: 'Identifiant unique du mouvement de trésorerie',
  })
  @ApiProperty({ description: 'ID du mouvement', example: 1 })
  id: number;

  @Column({
    name: 'date_operation',
    type: 'date',
    nullable: false,
    comment: 'Date de réalisation du mouvement',
  })
  @ApiProperty({ description: 'Date du mouvement', example: '2026-04-22' })
  dateOperation: string;

  @Column({
    name: 'type_mouvement',
    type: 'enum',
    enum: TypeMouvement,
    nullable: false,
    comment: 'Type de mouvement : entrée ou sortie',
  })
  @ApiProperty({
    description: "Type de mouvement (entree | sortie)",
    enum: TypeMouvement,
    example: TypeMouvement.SORTIE,
  })
  typeMouvement: TypeMouvement;

  @Column({
    name: 'coordination',
    type: 'varchar',
    length: 150,
    nullable: false,
    comment: 'Coordination provinciale concernée (ex: Nord-Kivu, Haut-Katanga)',
  })
  @ApiProperty({ description: 'Coordination provinciale', example: 'Nord-Kivu' })
  coordination: string;

  @Column({
    name: 'motif',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Motif ou libellé du mouvement (ex: Frais de communication)',
  })
  @ApiProperty({ description: 'Motif du mouvement', example: 'Frais de communication' })
  motif: string;

  @Column({
    name: 'reference_fed',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
    comment: 'Référence FED unique (ex: FED-DEP-2026-04-009)',
  })
  @ApiProperty({
    description: 'Référence FED unique',
    example: 'FED-DEP-2026-04-009',
    required: false,
  })
  referenceFed: string;

  @Column({
    name: 'beneficiaire',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'Bénéficiaire du mouvement (nom fournisseur, personne, etc.)',
  })
  @ApiProperty({
    description: 'Bénéficiaire',
    example: 'Vodacom RDC',
    required: false,
  })
  beneficiaire: string;

  @Column({
    name: 'montant',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: false,
    comment: 'Montant du mouvement en Francs Congolais (FC)',
  })
  @ApiProperty({ description: 'Montant en FC', example: 320000 })
  montant: number;

  @Column({
    name: 'solde_apres',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
    comment: 'Solde de la caisse après le mouvement',
  })
  @ApiProperty({ description: 'Solde après opération', example: 31680000 })
  soldeApres: number;

  @Column({
    name: 'devise',
    type: 'varchar',
    length: 10,
    nullable: false,
    default: 'FC',
    comment: 'Devise utilisée (FC par défaut)',
  })
  @ApiProperty({ description: 'Devise', example: 'FC', default: 'FC' })
  devise: string;

  @Column({
    name: 'agent_saisi',
    type: 'varchar',
    length: 150,
    nullable: true,
    comment: 'Nom de l\'agent ayant saisi le mouvement',
  })
  @ApiProperty({
    description: 'Agent ayant effectué la saisie',
    example: 'Jean-Pierre Kabila',
    required: false,
  })
  agentSaisi: string;

  @Column({
    name: 'observation',
    type: 'text',
    nullable: true,
    comment: 'Observation ou commentaire libre',
  })
  @ApiProperty({
    description: 'Observation complémentaire',
    required: false,
  })
  observation: string;

@Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    nullable: false,
    default: 'En attente',
    comment: 'Statut du mouvement (ex: En attente, Approuvé, Rejeté)',
  })
  @ApiProperty({
    description: 'Statut du mouvement',
    example: 'En attente',
    default: 'En attente',
  })
  status: string;
}
