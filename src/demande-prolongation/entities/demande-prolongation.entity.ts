import { Activity } from "src/activity/entities/activity.entity";
import { DemandeUser } from "src/demande-user/entities/demande-user.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name:"demandeProlongation"
})
export class DemandeProlongation extends Timestamp {

    @PrimaryGeneratedColumn()
    id:number

    @Column({
        name:'description',
        type:'text'
    })
    description:string

    @Column({
        name:'impact',
        type:'varchar'
    })
    impact:string

    @Column({
        name:'niveau',
        type:'varchar'
    })
    niveau:string

    @Column({
        name:'reponse',
        type:'varchar',
        nullable:false,
        default:'En attente'
    })
    reponse:string

    @Column({
        name:'commentaire',
        type:'text'
    })
    commentaire: string


    @Column({
        name:'activityId',
        type:'number'
    })
    activityId:number

    @Column({
        name:'userId',
        type:'number'
    })
    userId:number

    @ManyToOne(()=>User, (user)=>user.demandeProlongations, {eager:true})
    user:User

    @ManyToOne(()=>Activity, (activity)=>activity.demandes)
    activity:Activity


    @OneToMany(()=>DemandeUser,(demandeUser)=>demandeUser.demande,{eager:true})
    demandeUser:DemandeUser[]

}
