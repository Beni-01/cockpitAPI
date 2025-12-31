import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, RelationId } from 'typeorm';
import { BudgetSousActivity } from './budget-sous-activity.entity';
import { Budget } from './budget.entity';
import { BudgetActivity } from './budget-activity.entity';
import { Department } from 'src/department/entities/department.entity';

@Entity({ name: 'budget_tache' })
export class BudgetTache {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BudgetSousActivity, (s) => s.taches, { nullable: true })
  @JoinColumn({ name: 'sous_activity_id' })
  sousActivity?: BudgetSousActivity;

  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string;

  @Column({ name: 'code', type: 'varchar', length: 100, nullable: true })
  code?: string;

  @Column({ name: 'cost_code', type: 'varchar', length: 100, nullable: true })
  costCode?: string;

  @OneToMany(() => Budget, (b) => b.tache)
  budgets: Budget[];

  @ManyToOne(() => BudgetActivity, { nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity?: BudgetActivity;

  @RelationId((t: BudgetTache) => t.activity)
  activityId?: number;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @RelationId((t: BudgetTache) => t.department)
  departmentId?: number;
}
