import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GoogleSheetConfig } from './google-sheet-config.entity';

@Entity('google_sheet_sync_log')
export class SyncLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    config_id: number;

    @ManyToOne(() => GoogleSheetConfig, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'config_id' })
    config: GoogleSheetConfig;

    @Column({ type: 'enum', enum: ['webhook', 'polling', 'initial'], default: 'webhook' })
    trigger_source: string;

    @Column({ type: 'enum', enum: ['pending', 'in_progress', 'success', 'failed'] })
    status: string;

    @Column({ type: 'int', default: 0 })
    records_fetched: number;

    @Column({ type: 'int', default: 0 })
    records_inserted: number;

    @Column({ type: 'int', default: 0 })
    records_updated: number;

    @Column({ type: 'int', default: 0 })
    records_skipped: number;

    @Column({ type: 'text', nullable: true })
    error_message: string;

    @CreateDateColumn()
    started_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    completed_at: Date;
}
