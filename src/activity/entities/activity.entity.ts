import { AnnotationActivity } from "src/annotation-activity/entities/annotation-activity.entity";
import { DemandeProlongation } from "src/demande-prolongation/entities/demande-prolongation.entity";
import { Livrable } from "src/livrable/entities/livrable.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
        name:'resultat',
        type:'varchar',
        nullable:false
    })
    resultat:string


    @Column({
        name:'resultatObtenu',
        type:'varchar',
        nullable:true
    })
    resultatObtenu:string

    @Column({
        name:'province',
        type:'varchar',
        nullable:false
    })
    province:string;

    @Column({
        name:'direction',
        type:'varchar',
        nullable:true
    })
    direction?:string;

    @Column({
        name:'responsable',
        type:'varchar',
        nullable:false
    })
    responsable:string

    @Column({
        name:'budget',
        type:'int',
        nullable:true
    })
    budget:number

    @Column({
        name:'budgetConsomme',
        type:'int',
        nullable:true
    })
    budgetConsomme:number

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
        name:'dateFinReel',
        type:'date',
        nullable:true
    })
    dateFinReel:string

    @Column({
        name:'status',
        type:'varchar',
        nullable:true,
        default:'En attente'
    })
    status:string

    @Column({
        name:'etat',
        type:'varchar',
        nullable:true,
        default:'En attente'
    })
    etat:string

    @ManyToOne(()=>User, (user)=>user.activities, {eager:true})
    user:User

    @OneToOne(()=>Livrable, (livrable)=>livrable.activity, {eager:true})
    @JoinColumn({ name: 'livrableId' })
    livrable: Livrable

    @OneToMany(()=>SousActivity, (subactivities)=>subactivities.activity, {eager:true})
    subactivities:SousActivity[]

    @OneToMany(()=>DemandeProlongation, (demande)=>demande.activity, {eager:true})
    demandes:DemandeProlongation[]

    @OneToMany(()=>AnnotationActivity, (annotation)=>annotation.activity)
    annotations:AnnotationActivity[]

}
