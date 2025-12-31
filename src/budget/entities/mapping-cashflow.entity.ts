import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { BudgetActivity } from './budget-activity.entity';
import { Budget } from './budget.entity';
import { Department } from '../../department/entities/department.entity';

@Entity({ name: 'mapping_cash_flow' })
export class MappingCashFlow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @OneToMany(() => BudgetActivity, (a) => a.mappingCashFlow)
  activities: BudgetActivity[];

  @ManyToOne(() => Department, { nullable: true, eager: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @RelationId((m: MappingCashFlow) => m.department)
  departmentId?: number;

  @OneToMany(() => Budget, (b) => b.mappingCashFlow)
  budgets: Budget[];
}
