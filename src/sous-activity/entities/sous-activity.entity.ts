import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Column, PrimaryColumn } from "typeorm";

export class SousActivity  extends Timestamp{

    @PrimaryColumn()
    id:number;

    @Column({
        name:'titre',
        type:'varchar',
        nullable:false
    })
    titre:string;

    @Column({
        name:'resultat',
        type:'varchar',
        nullable:false
    })
    resultat:string

    @Column({
        name:'province',
        type:'varchar',
        nullable:false
    })
    province:string;

    @Column({
        name:'province',
        type:'varchar',
        nullable:false
    })
    responsable:string

    @Column({
        name:'province',
        type:'varchar',
        nullable:true
    })
    autreService:string

    @Column({
        name:'province',
        type:'varchar',
        nullable:false
    })
    debut: string

    @Column({
        name:'province',
        type:'varchar',
        nullable:false
    })
    fin:string

    @Column({
        name:'province',
        type:'varchar',
        nullable:false
    })
    indicateur:string

    @Column({
        name:'province',
        type:'varchar',
        nullable:false
    })
    budget:number

    @Column({
        name:'livrable',
        type:'varchar',
        nullable:false
    })
    livrable: string

}
