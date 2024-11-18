import { BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';


import { Exclude } from "class-transformer";
import { Camp } from "src/camps/entities/camp.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { StructureOng } from "src/structure_ong/entities/structure_ong.entity";
import { EnqueteProjet } from "src/enquete-projet/entities/enquete-projet.entity";
import { Menage } from "src/menage/entities/menage.entity";
import { IdVr } from "src/id-vr/entities/id-vr.entity";
import { IdentificationVictimesT3 } from "src/identification-victimes-t3/entities/identification-victimes-t3.entity";
import { UserForms } from "./contrat.entity";
import { Conflit } from "src/conflit/entities/conflit.entity";
import { Annotation } from "src/annotation/entities/annotation.entity";


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

    @OneToMany(()=>Camp, (camp)=>camp.user)
    camp:Camp[]


    @OneToMany(()=>StructureOng, (camp)=>camp.user)
    ong:StructureOng[]


    @OneToMany(()=>EnqueteProjet, (enquete)=>enquete.user)
    enquete:EnqueteProjet[]

    @OneToMany(()=>Menage, (menage)=>menage.user)
    menage:Menage[]

    @OneToMany(()=>IdVr, (idvr)=>idvr.user)
    idVr:IdVr[]

    @OneToMany(()=>IdentificationVictimesT3, (victime)=>victime.user)
    victimes:IdentificationVictimesT3

    @OneToMany(()=>UserForms, (forms)=>forms.user, {eager:true})
    forms:UserForms[]

    @OneToMany(()=>Conflit, (conflit)=>conflit.user)
    conflits:Conflit[]

    @OneToMany(()=>Annotation, (annotation)=>annotation.user)
    annotations:Annotation[]
  
}




