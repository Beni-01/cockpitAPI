import { DemandeProlongation } from "src/demande-prolongation/entities/demande-prolongation.entity";
import { Livrable } from "src/livrable/entities/livrable.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";

@Entity({
    name:'demande-user'
})
export class DemandeUser extends Timestamp{
        @PrimaryGeneratedColumn()
        id:number;
    
        @Column({
            name:'userId',
            type:'int'
        })
        userId:number;
    
        @Column({
            name:'demandeId',
            type:'int'
        })
        demandeId:number
    
        @Column({
            name:'date_signature',
            type:'datetime',
            nullable:true
        })
        date_signature?:Date;
    
        @Column({
            name:'isSign',
            type:'boolean',
            default:false
        })
        isSign?:boolean
    
        @ManyToOne(()=>User, (agent)=>agent.demandeUser, {eager:true})
        user:User;
    
        @ManyToOne(()=>DemandeProlongation, (demande)=>demande.demandeUser, {eager:true})
        demande:DemandeProlongation
}
