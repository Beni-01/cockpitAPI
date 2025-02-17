import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, Entity } from "typeorm";

@Entity({
    name:'auditLog'
})
export class AuditLog extends Timestamp{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({
        name:'tableName',
        type:'varchar'
    })
    tableName: string;
  
    @Column({
        name:'entityId',
        type:'int'
    })
    entityId: number;
  
    @Column({
        name:'action',
        type:'varchar'
    })
    action: string;
  
    @Column({ type: 'json', nullable: true })
    oldData: any;
  
    @Column({ type: 'json', nullable: true })
    newData: any;
  
    @Column({ name:'performedBy', type:'int', nullable: true })
    performedBy: number;
  
}
