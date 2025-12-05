import { ApiProperty } from "@nestjs/swagger";
import { Activity } from "src/activity/entities/activity.entity";
import { DemandeUser } from "src/demande-user/entities/demande-user.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "demandeProlongation"
})
export class DemandeProlongation extends Timestamp {

    @ApiProperty({
        description: "Identifiant unique de la demande de prolongation",
        example: 1
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: "Description détaillée de la demande de prolongation",
        example: "Besoin de 15 jours supplémentaires pour finaliser le rapport."
    })
    @Column({
        name: 'description',
        type: 'text'
    })
    description: string;

    @ApiProperty({
        description: "Impact de cette prolongation sur l'activité",
        example: "Retard léger sur la livraison"
    })
    @Column({
        name: 'impact',
        type: 'varchar'
    })
    impact: string;

    @ApiProperty({
        description: "Niveau d'impact de la demande (Faible, Moyen, Élevé)",
        example: "Élevé"
    })
    @Column({
        name: 'niveau',
        type: 'varchar'
    })
    niveau: string;

    @ApiProperty({
        description: "Réponse du manager ou superviseur",
        example: "En attente",
        default: "En attente"
    })
    @Column({
        name: 'reponse',
        type: 'varchar',
        nullable: false,
        default: 'En attente'
    })
    reponse: string;

    @ApiProperty({
        description: "Commentaire ajouté après la décision",
        example: "Prolongation accordée sous condition."
    })
    @Column({
        name: 'commentaire',
        type: 'text'
    })
    commentaire: string;

    @ApiProperty({
        description: "ID de l'activité concernée par cette demande",
        example: 12
    })
    @Column({
        name: 'activityId',
        type: 'int'
    })
    activityId: number;

    @ApiProperty({
        description: "ID de l'utilisateur ayant fait la demande",
        example: 4
    })
    @Column({
        name: 'userId',
        type: 'int'
    })
    userId: number;

    @ApiProperty({
        description: "Utilisateur ayant soumis la demande",
        type: () => User
    })
    @ManyToOne(() => User, (user) => user.demandeProlongations, { eager: true })
    user: User;

    @ApiProperty({
        description: "Activité liée à cette demande de prolongation",
        type: () => Activity
    })
    @ManyToOne(() => Activity, (activity) => activity.demandes)
    activity: Activity;

    @ApiProperty({
        description: "Liste des validations ou rejets des différents utilisateurs",
        type: () => [DemandeUser]
    })
    @OneToMany(() => DemandeUser, (demandeUser) => demandeUser.demande, { eager: true })
    demandeUser: DemandeUser[];
}
