import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('budget_data')
export class BudgetData {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    external_id: string;

    @Index()
    @Column({ type: 'varchar', length: 255, nullable: true })
    project_name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    budget_category: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    allocated_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    spent_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    remaining_amount: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    budget_period: string;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Index()
    @Column({ type: 'enum', enum: ['active', 'completed', 'cancelled'], default: 'active' })
    status: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'boolean', default: true })
    synced_from_sheet: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_synced_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
