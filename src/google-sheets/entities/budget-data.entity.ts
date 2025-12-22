import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { GoogleSheetConfig } from './google-sheet-config.entity';

@Entity('budget_data')
export class BudgetData {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ type: 'int', nullable: true })
    config_id: number;

    @ManyToOne(() => GoogleSheetConfig)
    @JoinColumn({ name: 'config_id' })
    config: GoogleSheetConfig;

    @Index()
    @Column({ type: 'varchar', length: 255, nullable: true })
    department_name: string;

    @Index()
    @Column({ type: 'varchar', length: 255, nullable: true })
    external_id: string;

    @Index()
    @Column({ type: 'varchar', length: 255, nullable: true })
    project_name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    budget_category: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    cost_center: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    account_code: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    allocated_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    spent_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    remaining_amount: number;

    @Index()
    @Column({ type: 'enum', enum: ['OPEX', 'CAPEX', 'Mixed'], default: 'OPEX' })
    budget_type: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    budget_period: string;

    @Index()
    @Column({ type: 'int', nullable: true })
    fiscal_year: number;

    @Column({ type: 'int', nullable: true })
    quarter: number;

    @Column({ type: 'int', nullable: true })
    month: number;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Index()
    @Column({ type: 'enum', enum: ['active', 'completed', 'cancelled'], default: 'active' })
    status: string;

    @Index()
    @Column({ type: 'enum', enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' })
    approval_status: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    responsible_person: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    province: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    territory: string;

    @Column({ type: 'boolean', default: true })
    synced_from_sheet: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_synced_at: Date;

    @Column({ type: 'varchar', length: 64, nullable: true })
    sync_hash: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
