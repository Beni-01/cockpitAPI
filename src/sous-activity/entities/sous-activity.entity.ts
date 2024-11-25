import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Activity } from "src/activity/entities/activity.entity";
import { Livrable } from "src/livrable/entities/livrable.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";



@Entity({
    name:'sousActivity'
})
export class SousActivity  extends Timestamp{

    @PrimaryGeneratedColumn()
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
        name:'responsable',
        type:'varchar',
        nullable:false
    })
    responsable:string

    @Column({
        name:'autreService',
        type:'varchar',
        nullable:true
    })
    autreService:string

    @Column({
        name:'debut',
        type:'varchar',
        nullable:false
    })
    debut: string

    @Column({
        name:'fin',
        type:'varchar',
        nullable:false
    })
    fin:string

    @Column({
        name:'dateFinReel',
        type:'date',
        nullable:true
    })
    dateFinReel:string

    @Column({
        name:'indicateur',
        type:'varchar',
        nullable:true
    })
    indicateur:string

    @Column({
        name:'resultatObtenu',
        type:'varchar',
        nullable:true
    })
    resultatObtenu:string

    @Column({
        name:'status',
        type:'varchar',
        nullable:true,
        default:'En attente'
    })
    status:string

    @Column({
        name:'budget',
        type:'int',
        nullable:false,
        default:0
    })
    budget:number

    @Column({
        name:'budgetConsomme',
        type:'int',
        nullable:true
    })
    budgetConsomme:number

    // @Column({
    //     name:'livrable',
    //     type:'varchar',
    //     nullable:false
    // })
    // livrable: string

    @Column({
        name:'activityId',
        type:'int',
        nullable:true
    })
    activityId:number

    @Column({
        name:'userId',
        type:'int',
        nullable:true
    })
    userId:number

    @ManyToOne(()=>User, (user)=>user.subactivities, {eager:true})
    user:User

    @ManyToOne(()=>Activity, (activity)=>activity.subactivities)
    activity:Activity

    @OneToOne(()=>Livrable, (livrable)=>livrable.subActivity, {eager:true})
    @JoinColumn({ name: 'livrableId' })
    livrable: Livrable

}
