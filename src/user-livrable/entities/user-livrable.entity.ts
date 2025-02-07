import { Livrable } from "src/livrable/entities/livrable.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";

@Entity({
    name:'user-livrable'
})
export class UserLivrable  extends Timestamp{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        name:'userId',
        type:'int'
    })
    userId:number;

    @Column({
        name:'livrableId',
        type:'int'
    })
    livrableId:number

    @Column({
        name:'date_validation',
        type:'datetime',
        nullable:true
    })
    date_validation?:Date;

    @Column({
        name:'isValidate',
        type:'boolean',
        default:false
    })
    isValidate?:boolean

    @ManyToOne(()=>User, (agent)=>agent.agentValidateur, {eager:true})
    user:User;

    @ManyToOne(()=>Livrable, (livrable)=>livrable.agentValidateur)
    livrable:Livrable
}
