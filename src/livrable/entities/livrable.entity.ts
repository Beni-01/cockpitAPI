import { Activity } from "src/activity/entities/activity.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Column, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
        nullable:false
    })
    description:string;

    @Column({
        name:'status',
        type:'varchar',
        nullable:false
    })
    status:string;

    @Column({
        name:'responsable',
        type:'varchar',
        nullable:false
    })
    responsable:string;

    @Column({
        name:'dateLivraisonAttendue',
        type:'varchar',
        nullable:false
    })
    dateLivraisonAttendue:string;

    @Column({
        name:'dateLivraisonReelle',
        type:'varchar',
        nullable:false
    })
    dateLivraisonReelle:string;

    @Column({
        name:'support',
        type:'varchar',
        nullable:false
    })
    support:string;

    @Column({
        name:'dateValidationAttendue',
        type:'varchar',
        nullable:false
    })
    dateValidationAttendue:string;

    @Column({
        name:'dateValidationReel',
        type:'varchar',
        nullable:false
    })
    dateValidationReel:string;

    @Column({
        name:'commentaire',
        type:'varchar',
        nullable:false
    })
    commentaire:string
  
    @OneToOne(()=>Activity, (activity)=>activity.livrable)
    activity:Activity

    @OneToOne(()=>SousActivity, (subActivity)=>subActivity.livrable)
    subActivity:SousActivity


}
