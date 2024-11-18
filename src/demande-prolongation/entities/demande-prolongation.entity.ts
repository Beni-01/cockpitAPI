import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name:"demandeProlongation"
})
export class DemandeProlongation extends Timestamp {

    @PrimaryGeneratedColumn()
    id:number

    @Column({
        name:'description',
        type:'varchar'
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
        type:'varchar'
    })
    reponse:string

    @Column({
        name:'commentaire',
        type:'varchar'
    })
    commentaire: string

    @ManyToOne(()=>User, (user)=>user.demandeProlongations, {eager:true})
    user:User

}
