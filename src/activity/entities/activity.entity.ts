import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Column, PrimaryGeneratedColumn } from "typeorm";

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
}
