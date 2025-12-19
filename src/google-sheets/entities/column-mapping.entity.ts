import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GoogleSheetConfig } from './google-sheet-config.entity';

@Entity('google_sheet_column_mapping')
export class ColumnMapping {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    config_id: number;

    @ManyToOne(() => GoogleSheetConfig, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'config_id' })
    config: GoogleSheetConfig;

    @Column({ type: 'varchar', length: 255 })
    sheet_column_name: string;

    @Column({ type: 'varchar', length: 255 })
    db_field_name: string;

    @Column({ type: 'enum', enum: ['string', 'number', 'date', 'boolean'], default: 'string' })
    data_type: string;

    @Column({ type: 'boolean', default: false })
    is_required: boolean;

    @Column({ type: 'text', nullable: true })
    default_value: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
