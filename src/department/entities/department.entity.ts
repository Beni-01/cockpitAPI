import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { MappingCashFlow } from '../../budget/entities/mapping-cashflow.entity';
import { BudgetActivity } from '../../budget/entities/budget-activity.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('department')
@Unique(['code'])
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.departments, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => MappingCashFlow, (m) => m.department)
  mappingCashFlows: MappingCashFlow[];

  @OneToMany(() => BudgetActivity, (a) => a.department)
  activities: BudgetActivity[];
}
