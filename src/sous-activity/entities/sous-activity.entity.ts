import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Activity } from "src/activity/entities/activity.entity";
import { Livrable } from "src/livrable/entities/livrable.entity";

@Entity({ name: 'sousActivity' })
export class SousActivity extends Timestamp {

    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'ID unique de la sous-activité' })
    id: number;

    @Column({ name: 'titre', type: 'text', nullable: false })
    @ApiProperty({ description: 'Titre de la sous-activité' })
    titre: string;

    @Column({ name: 'resultat', type: 'text', nullable: false })
    @ApiProperty({ description: 'Résultat attendu de la sous-activité' })
    resultat: string;

    @Column({ name: 'province', type: 'varchar', nullable: false })
    @ApiProperty({ description: 'Province concernée' })
    province: string;

    @Column({ name: 'responsable', type: 'varchar', nullable: false })
    @ApiProperty({ description: 'Responsable de la sous-activité' })
    responsable: string;

    @Column({ name: 'autreService', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Autre service impliqué' })
    autreService: string;

    @Column({ name: 'debut', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Date de début prévue' })
    debut: string;

    @Column({ name: 'fin', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Date de fin prévue' })
    fin: string;

    @Column({ name: 'dateFinReel', type: 'date', nullable: true })
    @ApiPropertyOptional({ description: 'Date de fin réelle' })
    dateFinReel: string;

    @Column({ name: 'indicateur', type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Indicateurs liés à la sous-activité' })
    indicateur: string;

    @Column({ name: 'resultatObtenu', type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Résultat obtenu' })
    resultatObtenu: string;

    @Column({
        name: 'status',
        type: 'varchar',
        default: 'En attente',
        nullable: true
    })
    @ApiPropertyOptional({ description: 'Statut de la sous-activité (ex: En attente, En cours, Terminé)' })
    status: string;

    @Column({ name: 'budget', type: 'int', nullable: true, default: 0 })
    @ApiPropertyOptional({ description: 'Budget alloué' })
    budget: number;

    @Column({ name: 'budgetConsomme', type: 'int', nullable: true })
    @ApiPropertyOptional({ description: 'Budget réellement consommé' })
    budgetConsomme: number;

    @Column({ name: 'activityId', type: 'int', nullable: true })
    @ApiPropertyOptional({ description: 'ID de l’activité parente' })
    activityId: number;

    @Column({ name: 'userId', type: 'int', nullable: true })
    @ApiPropertyOptional({ description: 'ID de l’utilisateur responsable' })
    userId: number;

    @Column({ name: 'livrableId', type: 'int', nullable: true })
    @ApiPropertyOptional({ description: 'ID du livrable lié' })
    livrableId: number;

    @Column({ name: 'deadlineRate', type: 'int', nullable: true, width: 3 })
    @ApiPropertyOptional({ description: "Pourcentage d'avancement par rapport au délai" })
    deadlineRate: number;

    @Column({ name: 'nbre_ressource', type: 'int', nullable: true, width: 3 })
    @ApiPropertyOptional({ description: 'Nombre de ressources engagées' })
    nbre_ressource: number;

    @ManyToOne(() => User, (user) => user.subactivities, { eager: true })
  
    user: User;

    @ManyToOne(() => Activity, (activity) => activity.subactivities)

    activity: Activity;

    @OneToOne(() => Livrable, (livrable) => livrable.subActivity, { eager: true })
    @JoinColumn({ name: 'livrableId' })
  
    livrable: Livrable;
}
