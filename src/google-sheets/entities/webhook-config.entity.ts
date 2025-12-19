import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GoogleSheetConfig } from './google-sheet-config.entity';

@Entity('google_sheet_webhook_config')
export class WebhookConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    config_id: number;

    @ManyToOne(() => GoogleSheetConfig, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'config_id' })
    config: GoogleSheetConfig;

    @Column({ type: 'varchar', length: 500 })
    webhook_url: string;

    @Column({ type: 'varchar', length: 255 })
    webhook_secret: string;

    @Column({ type: 'boolean', default: false })
    apps_script_installed: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_webhook_received: Date;

    @Column({ type: 'enum', enum: ['active', 'inactive', 'error'], default: 'inactive' })
    webhook_status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
