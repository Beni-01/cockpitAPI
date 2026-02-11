import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('google_sheet_config')
export class GoogleSheetConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  sheet_url: string;

  @Column({ type: 'varchar', length: 255 })
  sheet_id: string;

  // Alias for sheet_id (camelCase)
  get spreadsheetId(): string {
    return this.sheet_id;
  }
  set spreadsheetId(value: string) {
    this.sheet_id = value;
  }

  @Column({ type: 'varchar', length: 255, default: 'Sheet1' })
  worksheet_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  range: string;

  @Column({ type: 'enum', enum: ['oauth', 'service_account'], default: 'oauth' })
  auth_type: string;

  @Column({ type: 'text', nullable: true })
  credentials_encrypted: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Alias for is_active (camelCase)
  get isActive(): boolean {
    return this.is_active;
  }
  set isActive(value: boolean) {
    this.is_active = value;
  }

  @Column({ type: 'boolean', default: false })
  use_polling: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_sync_at: Date;

  // Alias for last_sync_at (camelCase)
  get lastSyncAt(): Date {
    return this.last_sync_at;
  }
  set lastSyncAt(value: Date) {
    this.last_sync_at = value;
  }

  @Column({ name: 'last_sync_status', type: 'varchar', length: 50, nullable: true })
  lastSyncStatus: string;

  @Column({ name: 'last_sync_message', type: 'text', nullable: true })
  lastSyncMessage: string;

  @Column({
    name: 'column_mapping',
    type: 'json',
    nullable: true,
    transformer: {
      to: (value: any) => value ? JSON.stringify(value) : null,
      from: (value: any) => {
        if (!value) return null;
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        }
        return value;
      }
    }
  })
  columnMapping: any;

  @Column({ type: 'int' })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
