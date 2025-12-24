import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BudgetData } from './budget-data.entity';
import { GoogleSheetConfig } from './google-sheet-config.entity';

@Entity('budget_data_change_log')
export class BudgetDataChangeLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ type: 'int' })
    budget_data_id: number;

    @ManyToOne(() => BudgetData)
    @JoinColumn({ name: 'budget_data_id' })
    budgetData: BudgetData;

    @Index()
    @Column({ type: 'int' })
    config_id: number;

    @ManyToOne(() => GoogleSheetConfig)
    @JoinColumn({ name: 'config_id' })
    config: GoogleSheetConfig;

    @Index()
    @Column({ type: 'varchar', length: 100 })
    field_name: string;

    @Column({ type: 'text', nullable: true })
    old_value: string;

    @Column({ type: 'text', nullable: true })
    new_value: string;

    @Column({ type: 'varchar', length: 100, default: 'sync' })
    changed_by: string;

    @Index()
    @CreateDateColumn()
    changed_at: Date;

    @Column({ type: 'int', nullable: true })
    sync_log_id: number;
}
