import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coordination } from '../../coordination/entities/coordination.entity';

@Entity('charroi')
export class Charroi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  marque: string; // e.g., Toyota

  @Column()
  modele: string; // e.g., Land Cruiser, Hilux

  @Column({ unique: true })
  immatriculation: string;

  @Column({
    type: 'enum',
    enum: ['Opérationnel', 'En panne', 'Maintenance', 'Non affecté'],
    default: 'Opérationnel',
  })
  status: string;

  @Column({ nullable: true })
  coordinationId: number;

  @ManyToOne(() => Coordination, { nullable: true })
  @JoinColumn({ name: 'coordinationId' })
  coordination: Coordination;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
