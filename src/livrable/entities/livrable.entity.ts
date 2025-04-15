import { Activity } from "src/activity/entities/activity.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { UserLivrable } from "src/user-livrable/entities/user-livrable.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name:'livrable'
})
export class Livrable extends Timestamp {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        name:'livrable',
        type:'varchar',
        nullable:false
    })
    livrable:string;
    
    @Column({
        name:'description',
        type:'varchar',
        nullable:true
    })
    description:string;

    @Column({
        name:'status',
        type:'varchar',
        nullable:true,
        default:'En attente'
    })
    status:string;

    @Column({
        name:'responsable',
        type:'varchar',
        nullable:true
    })
    responsable:string;

    @Column({
        name:'dateLivraisonAttendue',
        type:'varchar',
        nullable:true
    })
    dateLivraisonAttendue:string;

    @Column({
        name:'dateLivraisonReelle',
        type:'varchar',
        nullable:true
    })
    dateLivraisonReelle:string;

    @Column({
        name:'typelivrable',
        type:'varchar',
        nullable:true
    })
    typelivrable:string;

    @Column({
        name:'livrablefileName',
        type:'varchar',
        nullable:true
    })
    livrablefileName:string

    @Column({
        name:'support',
        type:'varchar',
        nullable:true
    })
    support:string;

    @Column({
        name:'dateValidationAttendue',
        type:'varchar',
        nullable:true
    })
    dateValidationAttendue:string;

    @Column({
        name:'dateValidationReel',
        type:'varchar',
        nullable:true
    })
    dateValidationReel:string;

    @Column({
        name:'commentaire',
        type:'varchar',
        nullable:true
    })
    commentaire:string

    @Column({
        name:'livrableQuality',
        type:'int',
        nullable:true,
        length:3
    })
    livrableQuality:number

    @OneToOne(()=>Activity, (activity)=>activity.livrable)
    activity:Activity

    @OneToOne(()=>SousActivity, (subActivity)=>subActivity.livrable)
    subActivity:SousActivity

    @OneToMany(()=>UserLivrable,(agentValidateur)=>agentValidateur.livrable, {eager:true})
    agentValidateur:UserLivrable[]

}
