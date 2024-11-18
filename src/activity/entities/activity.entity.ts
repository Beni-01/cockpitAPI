import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
        nullable:true
    })
    status:string

    @ManyToOne(()=>User, (user)=>user.activities, {eager:true})
    user:User
    
}
