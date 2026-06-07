import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { IcmAssignmentScope, IcmPeriodicity } from '../enums';
import { IcmTacheLivrable } from './icm-tache-livrable.entity';

@Entity({ name: 'icm_tache' })
@Index(['domaine', 'isActive'])
@Index(['periodicite', 'isActive'])
export class IcmTache extends Timestamp {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de la tâche ICM', example: 1 })
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  @ApiProperty({
    description: 'Domaine de la tâche ICM',
    example: 'Ressources Humaines',
  })
  domaine: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  @ApiProperty({
    description: 'Libellé de la tâche managériale',
    example: 'Entretiens mensuels réalisés',
  })
  tacheManageriale: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({
    description: 'Description détaillée de la tâche',
    example:
      'Décrire précisément l’obligation attendue, le contexte et les exigences qualitatives.',
  })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @ApiProperty({
    description: 'Livrable attendu',
    example: 'Rapport',
  })
  livrableAttendu: string;

  @Column({
    type: 'enum',
    enum: IcmPeriodicity,
    nullable: false,
  })
  @ApiProperty({
    description: 'Périodicité de la tâche',
    enum: IcmPeriodicity,
    example: IcmPeriodicity.HEBDOMADAIRE,
  })
  periodicite: IcmPeriodicity;

  @Column({ type: 'date', nullable: false })
  @ApiProperty({
    description: 'Date de début',
    example: '2026-06-01',
  })
  dateDebut: string;

  @Column({ type: 'date', nullable: false })
  @ApiProperty({
    description: 'Date limite',
    example: '2026-06-30',
  })
  dateLimite: string;

  @Column({
    type: 'enum',
    enum: IcmAssignmentScope,
    default: IcmAssignmentScope.ALL_PROVINCES,
  })
  @ApiProperty({
    description: 'Portée de l’assignation',
    enum: IcmAssignmentScope,
    example: IcmAssignmentScope.ALL_PROVINCES,
  })
  porteeAssignation: IcmAssignmentScope;

  @Column({ type: 'json', nullable: true })
  @ApiPropertyOptional({
    description: 'Provinces ciblées lorsque la portée vaut SPECIFIC_PROVINCES',
    type: [String],
    example: ['Kinshasa', 'Haut-Katanga'],
  })
  provincesAssignees: string[];

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({
    description: 'Instructions spécifiques',
    example: 'Utiliser le modèle officiel DCP.',
  })
  instructionsSpecifiques: string;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({
    description: 'Ordre d’affichage',
    example: 1,
  })
  ordre: number;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({
    description: 'Indique si la tâche est active',
    example: true,
  })
  isActive: boolean;

  @OneToMany(() => IcmTacheLivrable, (livrable) => livrable.tache)
  livrables: IcmTacheLivrable[];
}
