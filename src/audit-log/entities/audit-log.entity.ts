
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";

@Entity({
    name:'auditLog'
})
export class AuditLog extends Timestamp{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({
        name:'tableName',
        type:'varchar',
        nullable:true
    })
    tableName: string;
  
    @Column({
        name:'entityId',
        type:'int',
        nullable:true
    })
    entityId: number;
  
    @Column({
        name:'action',
        type:'varchar',
        nullable:true
    })
    action: string;
  
    @Column({ type: 'json', nullable: true })
    oldData: any;
  
    @Column({ type: 'json', nullable: true })
    newData: any;
  
    @Column({ name:'userId', type:'int', nullable: true })
    userId: number;

    @ManyToOne(()=>User, (user)=>user.auditable, {eager:true})
    user:User
  
}
