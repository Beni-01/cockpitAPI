import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GoogleSheetConfig } from './google-sheet-config.entity';

@Entity('google_sheet_sync_schedule')
export class SyncSchedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    config_id: number;

    @ManyToOne(() => GoogleSheetConfig, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'config_id' })
    config: GoogleSheetConfig;

    @Column({ type: 'enum', enum: ['webhook', 'polling'], default: 'webhook' })
    sync_type: string;

    @Column({ type: 'enum', enum: ['1min', '5min', '15min', '30min', '1hour'], nullable: true })
    frequency: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    cron_expression: string;

    @Column({ type: 'boolean', default: false })
    is_enabled: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_sync_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    next_sync_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
