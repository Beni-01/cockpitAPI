import { Timestamp } from 'src/timestime-entity/timestamp.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';


@Entity('disbursements')
export class Disbursement extends Timestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  documentDate: Date;

  @Column({ type: 'date', nullable: true })
  datePayment: Date;

  @Column({ type: 'varchar', length: 100 })
  direction: string;

  @Column({ type: 'varchar', length: 100 })
  reference: string;

  @Column({ type: 'text' })
  expenseNature: string;

  @Column({ type: 'text' })
  beneficiary: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  eurAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cdfAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  usdAmount: number;

  @Column({ type: 'varchar', length: 100 })
  paymentSource: string;

  @Column({ type: 'text' })
  supportingDocumentation: string;

  @Column({ 
    type: 'varchar',
    default: "EN ATTENTE" 
  })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  month: string;

  @Column({ type: 'date', nullable: true })
  periodDate: Date; 

  @Column({ type: 'varchar', length: 100, nullable: true })
  period: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

}
