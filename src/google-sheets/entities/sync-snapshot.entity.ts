import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('sync_snapshots')
@Index(['config_id', 'created_at'])
export class SyncSnapshot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    config_id: number;

    @Column({ type: 'int', nullable: true })
    sync_log_id: number;

    @Column({ type: 'longtext' })
    snapshot_data: string;

    @Column({ type: 'int', default: 0 })
    record_count: number;

    @Column({ type: 'varchar', length: 64, nullable: true })
    snapshot_hash: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: ['pre_sync', 'post_sync', 'manual'], default: 'pre_sync' })
    snapshot_type: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    created_by: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    expires_at: Date;

    @Column({ type: 'boolean', default: false })
    is_restored: boolean;

    @Column({ type: 'timestamp', nullable: true })
    restored_at: Date;
}
