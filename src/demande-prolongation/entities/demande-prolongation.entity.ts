import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Column, PrimaryGeneratedColumn } from "typeorm";

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

}
