import { BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Activity } from "src/activity/entities/activity.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { DemandeProlongation } from "src/demande-prolongation/entities/demande-prolongation.entity";
import { AnnotationActivity } from "src/annotation-activity/entities/annotation-activity.entity";
import { UserLivrable } from "src/user-livrable/entities/user-livrable.entity";
import { DemandeUser } from "src/demande-user/entities/demande-user.entity";


@Entity({
    name:'user'
})
export class User extends Timestamp {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        name:'nom',
        type:'varchar'
    })
    nom:string;

    @Column({
        name:'signature',
        type:'text',
        nullable:true
    })
    signature:string;

    @Column({
        name:'postnom',
        type:'varchar',
        nullable:true
    })
    postnom:string;

    @Column({
        name:'prenom',
        type:'varchar'
    })
    prenom:string;

   @Column({
        name:'email',
        type:'varchar',
        nullable:true
    })
    email:string

    @Column({
        name:'sexe',
        type:'char'
    })
    sexe:string

    @Column({
        name:'telephone',
        type:'varchar',
        nullable:true
    })
    telephone:string

    @Column({
        name:'otp',
        type:'text',
        nullable:true,
    })
    otp:string

    @Column({
        name:'username',
        type:'varchar',
      
    })
    username:string;

    @Column({
        name:'password',
        type:'varchar',
        default:"N/A"
      
    })
    password:string;

    @Column(
        {
            name:'isSupervisor',
            type:'boolean',
            default:false
        }
    )
    isSupervisor:boolean

    @Column(
        {
            name:'isActive',
            type:'boolean',
            default:false
        }
    )
    isActivate:boolean

    @Column(
        {
            name:'status',
            type:'boolean',
            default:true
        }
    )
    status:boolean

    @Column(
        {
           name:'directionId',
           type:'int',
           nullable:true
        }
    )
    directionId?:number


    @Column(
        {
           name:'directionGeneraleId',
           type:'int',
           nullable:true
        }
    )
    directionGeneraleId?:number


    @Column(
        {
           name:'serviceId',
           type:'int',
           nullable:true
        }
    )
    serviceId:number

    @Column(
        {
           name:'divisionId',
           type:'int',
           nullable:true
        }
    )
    divisionId:number

    @Column(
        {
            name:'division',
            type:'varchar',
            nullable:true
        }
    )
    division?:string

    @Column(
        {
            name:'isSetPassword',
            type:'boolean',
            default:false
        }
    )
    isSetPassword:boolean

    @Column(
        {
            name:'service',
            type:'varchar',
            nullable:true
        }
    )
    service?:string


    @Column(
        {
            name:'direction',
            type:'varchar',
            nullable:true
        }
    )
    direction?:string


    @Column(
        {
            name:'fonction',
            type:'varchar',
            nullable:true
        }
    )
    fonction?:string


    @Column(
        {
            name:'grade',
            type:'varchar',
            nullable:true
        }
    )
    grade?:string

    @Column(
        {
            name:'directeurId',
            type:'int',
            nullable:true
        }
    )
    directeurId:number

    @Column(
        {
            name:'agentDelegueId',
            type:'int',
            nullable:true
        }
    )
    agentDelegueId?: number; 


    @OneToMany(()=>Activity, (activity)=>activity.user)
    activities:Activity[]

    @OneToMany(()=>SousActivity, (subactivity)=> subactivity.user)
    subactivities:SousActivity[]

    @OneToMany(()=>DemandeProlongation, (demandeProlongations)=> demandeProlongations.user)
    demandeProlongations:DemandeProlongation[]

    @OneToMany(()=>AnnotationActivity, (annotation)=>annotation.user)
    annotations:AnnotationActivity[]

    @OneToMany(()=>UserLivrable,(agentValidateur)=>agentValidateur.user)
    agentValidateur:UserLivrable[]

    @OneToMany(()=>DemandeUser,(demandeUser)=>demandeUser.user)
    demandeUser:DemandeUser[]
}




