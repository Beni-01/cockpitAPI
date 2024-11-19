import { DemandeProlongation } from "src/demande-prolongation/entities/demande-prolongation.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name:'activity'
})
export class Activity extends Timestamp {
    
    @PrimaryGeneratedColumn()
    id:number

    @Column({
        name:'titre',
        type:'varchar',
        nullable:false
    })
    titre:string

    @Column({
        name:'description',
        type:'varchar',
        nullable:true
    })
    description:string

    @Column({
        name:'dateDebut',
        type:'date',
        nullable:true
    })
    dateDebut:string

    @Column({
        name:'dateFin',
        type:'date',
        nullable:true
    })
    dateFin:string

    @Column({
        name:'status',
        type:'varchar',
        nullable:true,
        default:'En attente'
    })
    status:string

    @ManyToOne(()=>User, (user)=>user.activities, {eager:true})
    user:User

    @OneToMany(()=>SousActivity, (subactivities)=>subactivities.activity, {eager:true})
    subactivities:SousActivity[]

    @OneToMany(()=>DemandeProlongation, (demande)=>demande.activity, {eager:true})
    demandes:DemandeProlongation[]

}
