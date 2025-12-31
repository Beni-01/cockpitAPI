
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name:'transaction'
})
export class Transaction extends Timestamp{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        name:'depense',
        type: 'decimal',
        precision: 20, // Précision totale (nombre total de chiffres)
        scale: 2,      // Nombre de chiffres après la virgule
        nullable: true // Si le champ peut être null
    })
    depense:number;

    @Column({
        name:'depense_init',
        type: 'decimal',
        precision: 20, // Précision totale (nombre total de chiffres)
        scale: 2,      // Nombre de chiffres après la virgule
        nullable: true // Si le champ peut être null
    })
    depense_init:number;

    @Column({
        name:'devise',
        nullable:false,
        type:'varchar',
        default:"USD"
    })
    devise:string;

    @Column({
        name:'devise_convert',
        nullable:false,
        type:'varchar',
        default:"USD"
    })
    devise_convert:string

    @Column({
        name:'description',
        type:'text',
        nullable:true
    })
    description:string;

    @Column({
        name:'ref',
        type:'varchar',
        nullable:true
    })
    ref:string;

    @Column({
        name:'agent',
        nullable:true,
        type:'varchar'
    })
    agentId:string


    @Column({
        name:'centreId',
        nullable:true,
        type:'int'
    })
    centreId:number


    // @ManyToOne(()=>CentreCout, (centre)=>centre.transactions)
    // centre:CentreCout

}
