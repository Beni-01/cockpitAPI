import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, RelationId } from 'typeorm';
import { BudgetActivity } from './budget-activity.entity';
import { BudgetTache } from './budget-tache.entity';
import { Budget } from './budget.entity';
import { Department } from 'src/department/entities/department.entity';

@Entity({ name: 'budget_sous_activity' })
export class BudgetSousActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BudgetActivity, (a) => a.sousActivities, { nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity?: BudgetActivity;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @RelationId((s: BudgetSousActivity) => s.department)
  departmentId?: number;

  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string;

  @Column({ name: 'code', type: 'varchar', length: 100, nullable: true })
  code?: string;

  @OneToMany(() => BudgetTache, (t) => t.sousActivity)
  taches: BudgetTache[];

  @OneToMany(() => Budget, (b) => b.sousActivity)
  budgets: Budget[];
}
