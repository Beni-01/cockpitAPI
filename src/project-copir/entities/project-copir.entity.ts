import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('project_copir')
export class ProjectCopir {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: [
      'Direction des Coordinations',
      'Direction Financière',
      'Direction des Opérations',
      'Direction des Finances',
      'Autres',
    ],
  })
  direction: string;

  @Column({
    type: 'enum',
    enum: ['Planifié', 'En cours', 'Terminé', 'En retard'],
    default: 'Planifié',
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0 to 100

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  completionDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
