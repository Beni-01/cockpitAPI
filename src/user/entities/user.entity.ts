import { BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Activity } from "src/activity/entities/activity.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { DemandeProlongation } from "src/demande-prolongation/entities/demande-prolongation.entity";
import { AnnotationActivity } from "src/annotation-activity/entities/annotation-activity.entity";


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

    @ManyToOne(() => User, (directeur) => directeur.directedUsers, { nullable: true})
    directeur?: User; 

    @OneToMany(() => User, (user) => user.directeur)
    directedUsers: User[];


    @OneToOne(() => User, (agentDelegue) => agentDelegue.agentDelegue, { nullable: true})
    @JoinColumn()
    agentDelegue?: User; 


    @OneToMany(()=>Activity, (activity)=>activity.user)
    activities:Activity[]

    @OneToMany(()=>SousActivity, (subactivity)=> subactivity.user)
    subactivities:SousActivity[]

    @OneToMany(()=>DemandeProlongation, (demandeProlongations)=> demandeProlongations.user)
    demandeProlongations:DemandeProlongation[]

    @OneToMany(()=>AnnotationActivity, (annotation)=>annotation.user)
    annotations:AnnotationActivity[]
}




