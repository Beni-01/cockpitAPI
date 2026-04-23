import { ApiProperty } from '@nestjs/swagger';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Antenne } from 'src/antenne/entities/antenne.entity';

export enum CoordinationType {
  RECOUVREMENT = 'Recouvrement',
  ADMINISTRATIVE = 'Administrative',
}

export enum CoordinationStatus {
  ACTIVE = 'Active',
  EN_COURS = 'En cours de mise en place',
}

@Entity({ name: 'coordination' })
export class Coordination extends Timestamp {
  @ApiProperty({ description: 'ID unique de la coordination', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nom de la coordination',
    example: 'Coordination Provinciale du Haut-Katanga',
  })
  @Column({ type: 'varchar', nullable: false })
  nom: string;

  @ApiProperty({
    description: 'Type de coordination',
    enum: CoordinationType,
    example: CoordinationType.RECOUVREMENT,
  })
  @Column({
    type: 'enum',
    enum: CoordinationType,
    default: CoordinationType.ADMINISTRATIVE,
  })
  type: CoordinationType;

  @ApiProperty({ description: 'Province de la coordination', example: 'Haut-Katanga' })
  @Column({ type: 'varchar', nullable: false })
  province: string;

  @ApiProperty({
    description: 'Adresse physique',
    example: 'Avenue Lumumba, n°45, Lubumbashi',
  })
  @Column({ type: 'varchar', nullable: true })
  adresse: string;

  @ApiProperty({
    description: 'Statut de la coordination',
    enum: CoordinationStatus,
    default: CoordinationStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: CoordinationStatus,
    default: CoordinationStatus.ACTIVE,
  })
  status: CoordinationStatus;

  // ── Coordonnateur ──────────────────────────────────────────────────────────

  @ApiProperty({ description: 'Nom du coordonnateur', example: 'Jean-Pierre Kabongo' })
  @Column({ type: 'varchar', nullable: true })
  coordonnateurNom: string;

  @ApiProperty({ description: 'Téléphone du coordonnateur', example: '+243 812 345 678' })
  @Column({ type: 'varchar', nullable: true })
  coordonnateurTelephone: string;

  @ApiProperty({ description: 'Email du coordonnateur', example: 'jp.kabongo@fonarev.cd' })
  @Column({ type: 'varchar', nullable: true })
  coordonnateurEmail: string;

  // ── Effectifs ──────────────────────────────────────────────────────────────

  @ApiProperty({ description: 'Nombre actuel d\'agents', example: 98 })
  @Column({ type: 'int', default: 0 })
  effectifActuel: number;

  @ApiProperty({ description: 'Effectif prévu (cible)', example: 120 })
  @Column({ type: 'int', default: 0 })
  effectifPrevu: number;

  @OneToMany(() => Antenne, (antenne) => antenne.coordination)
  antennes: Antenne[];
}
