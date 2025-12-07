import { ApiProperty } from "@nestjs/swagger";
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

    @ApiProperty({ description: "Identifiant unique de l'activité", example: 1 })
    @PrimaryGeneratedColumn()
    id:number

    @ApiProperty({ description: "Titre de l'activité", example: "Sensibilisation des victimes" })
    @Column({ name:'titre', type:'text', nullable:false })
    titre:string

    @ApiProperty({ description: "Description détaillée", example: "Campagne de sensibilisation dans la province du Nord-Kivu" })
    @Column({ name:'description', type:'varchar', nullable:true })
    description:string

    @ApiProperty({ description: "Résultat attendu", example: "Atteindre 100 bénéficiaires" })
    @Column({ name:'resultat', type:'varchar', nullable:false })
    resultat:string

    @ApiProperty({ description: "Résultat réellement obtenu", example: "85 bénéficiaires atteints", nullable: true })
    @Column({ name:'resultatObtenu', type:'varchar', nullable:true })
    resultatObtenu:string

    @ApiProperty({ description: "Province concernée", example: "Nord-Kivu" })
    @Column({ name:'province', type:'varchar', nullable:false })
    province:string;

    @ApiProperty({ description: "Direction responsable", example: "Direction des opérations", nullable:true })
    @Column({ name:'direction', type:'varchar', nullable:true })
    direction?:string;

    @ApiProperty({ description: "Nom de la personne responsable", example: "Jean Mukendi", nullable:true })
    @Column({ name:'responsable', type:'varchar', nullable:true })
    responsable?:string

    @ApiProperty({ description: "Budget alloué", example: 5000, default: 0 })
    @Column({ name:'budget', type:'int', nullable:true, default:0 })
    budget:number

    @ApiProperty({ description: "Budget consommé", example: 3500, nullable:true })
    @Column({ name:'budgetConsomme', type:'int', nullable:true })
    budgetConsomme:number

    @ApiProperty({ description: "Date de début", example: "2025-01-10", nullable:true })
    @Column({ name:'dateDebut', type:'date', nullable:true })
    dateDebut:string

    @ApiProperty({ description: "Date de fin prévue", example: "2025-01-20", nullable:true })
    @Column({ name:'dateFin', type:'date', nullable:true })
    dateFin:string

    @ApiProperty({ description: "Date de fin réelle", example: "2025-01-22", nullable:true })
    @Column({ name:'dateFinReel', type:'date', nullable:true })
    dateFinReel:string

    @ApiProperty({ description: "Statut de l'activité", example: "En cours", default: "En attente" })
    @Column({ name:'status', type:'varchar', nullable:true, default:'En attente' })
    status:string

    @ApiProperty({ description: "État d'avancement général", example: "Terminé", default: "En attente" })
    @Column({ name:'etat', type:'varchar', nullable:true, default:'En attente' })
    etat:string

    @ApiProperty({ description: "Taux de respect de la deadline (0-100%)", example: 75, nullable:true })
    @Column({ name:'deadlineRate', type:'int', nullable:true, width:3 })
    deadlineRate:number

    @ApiProperty({ description: "Nombre de ressources affectées", example: 4 })
    @Column({ name:'nbre_ressource', type:'int', nullable:true, width:3 })
    nbre_ressource:number

    @ApiProperty({ description: "ID de l'utilisateur créateur", example: 12 })
    @Column({ name:'userId', type:'int', nullable:true })
    userId:number

    @ApiProperty({ description: "Utilisateur associé" })
    @ManyToOne(()=>User, (user)=>user.activities, {eager:true})
    user:User

    @ApiProperty({ description: "Livrable lié à l'activité" })
    @OneToOne(()=>Livrable, (livrable)=>livrable.activity, {eager:true})
    @JoinColumn({ name: 'livrableId' })
    livrable: Livrable

    @ApiProperty({ description: "Liste des sous-activités" })
    @OneToMany(()=>SousActivity, (subactivities)=>subactivities.activity, {eager:true})
    subactivities:SousActivity[]

    @ApiProperty({ description: "Demandes de prolongation liées" })
    @OneToMany(()=>DemandeProlongation, (demande)=>demande.activity, {eager:true})
    demandes:DemandeProlongation[]

    @ApiProperty({ description: "Annotations liées à l'activité" })
    @OneToMany(()=>AnnotationActivity, (annotation)=>annotation.activity, {eager:true})
    annotations:AnnotationActivity[]

}
