import { PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    tableName: string;
  
    @Column()
    entityId: number;
  
    @Column()
    action: string;
  
    @Column({ type: 'json', nullable: true })
    oldData: any;
  
    @Column({ type: 'json', nullable: true })
    newData: any;
  
    @Column({ nullable: true })
    performedBy: number;
  
    @CreateDateColumn()
    performedAt: Date;
}
