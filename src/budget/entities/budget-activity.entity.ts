import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, RelationId } from 'typeorm';
import { MappingCashFlow } from './mapping-cashflow.entity';
import { BudgetSousActivity } from './budget-sous-activity.entity';
import { Budget } from './budget.entity';
import { Department } from 'src/department/entities/department.entity';

@Entity({ name: 'budget_activity' })
export class BudgetActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MappingCashFlow, (m) => m.activities, { nullable: true })
  @JoinColumn({ name: 'mapping_cash_flow_id' })
  mappingCashFlow?: MappingCashFlow;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ name: 'code', type: 'varchar', length: 100, nullable: true })
  code?: string;

  @ManyToOne(() => Department, (c) => c.activities, { nullable: true, eager: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @RelationId((b: BudgetActivity) => b.department)
  departmentId?: number;

  @OneToMany(() => BudgetSousActivity, (s) => s.activity)
  sousActivities: BudgetSousActivity[];

  @OneToMany(() => Budget, (b) => b.activity)
  budgets: Budget[];
}
