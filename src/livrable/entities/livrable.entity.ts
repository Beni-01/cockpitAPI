import { ApiProperty } from "@nestjs/swagger";
import { Activity } from "src/activity/entities/activity.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { UserLivrable } from "src/user-livrable/entities/user-livrable.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: 'livrable'
})
export class Livrable extends Timestamp {

    @ApiProperty({
        description: "Identifiant unique du livrable",
        example: 12
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: "Titre ou nom du livrable",
        example: "Rapport mensuel"
    })
    @Column({
        name: 'livrable',
        type: 'varchar',
        nullable: false
    })
    livrable: string;
    
    @ApiProperty({
        description: "Description du livrable",
        example: "Rapport détaillant l'état d'avancement du projet.",
        nullable: true
    })
    @Column({
        name: 'description',
        type: 'varchar',
        nullable: true
    })
    description: string;

    @ApiProperty({
        description: "Statut actuel du livrable",
        example: "En attente",
        default: "En attente"
    })
    @Column({
        name: 'status',
        type: 'varchar',
        nullable: true,
        default: 'En attente'
    })
    status: string;

    @ApiProperty({
        description: "Nom du responsable du livrable",
        example: "Jean Mbayo",
        nullable: true
    })
    @Column({
        name: 'responsable',
        type: 'varchar',
        nullable: true
    })
    responsable: string;

    @ApiProperty({
        description: "Date prévue pour la livraison du livrable",
        example: "2025-03-15",
        nullable: true
    })
    @Column({
        name: 'dateLivraisonAttendue',
        type: 'varchar',
        nullable: true
    })
    dateLivraisonAttendue: string;

    @ApiProperty({
        description: "Date réelle de livraison du livrable",
        example: "2025-03-18",
        nullable: true
    })
    @Column({
        name: 'dateLivraisonReelle',
        type: 'varchar',
        nullable: true
    })
    dateLivraisonReelle: string;

    @ApiProperty({
        description: "Type du livrable",
        example: "Document PDF",
        nullable: true
    })
    @Column({
        name: 'typelivrable',
        type: 'varchar',
        nullable: true
    })
    typelivrable: string;

    @ApiProperty({
        description: "Nom du fichier associé au livrable",
        example: "rapport_final.pdf",
        nullable: true
    })
    @Column({
        name: 'livrablefileName',
        type: 'varchar',
        nullable: true
    })
    livrablefileName: string;

    @ApiProperty({
        description: "Support utilisé pour transmettre le livrable",
        example: "Email",
        nullable: true
    })
    @Column({
        name: 'support',
        type: 'varchar',
        nullable: true
    })
    support: string;

    @ApiProperty({
        description: "Date prévue pour la validation du livrable",
        example: "2025-03-20",
        nullable: true
    })
    @Column({
        name: 'dateValidationAttendue',
        type: 'varchar',
        nullable: true
    })
    dateValidationAttendue: string;

    @ApiProperty({
        description: "Date réelle de validation",
        example: "2025-03-22",
        nullable: true
    })
    @Column({
        name: 'dateValidationReel',
        type: 'varchar',
        nullable: true
    })
    dateValidationReel: string;

    @ApiProperty({
        description: "Commentaire lié au livrable",
        example: "Livrable validé mais nécessite révision.",
        nullable: true
    })
    @Column({
        name: 'commentaire',
        type: 'varchar',
        nullable: true
    })
    commentaire: string;

    @ApiProperty({
        description: "Qualité du livrable (notation sur 100)",
        example: 87,
        nullable: true
    })
    @Column({
        name: 'livrableQuality',
        type: 'int',
        nullable: true,
        width: 3
    })
    livrableQuality: number;

    @ApiProperty({
        description: "Activité principale associée au livrable",
    })
    @OneToOne(() => Activity, (activity) => activity.livrable)
    activity: Activity;

    @ApiProperty({
        description: "Sous-activité associée au livrable",
    })
    @OneToOne(() => SousActivity, (subActivity) => subActivity.livrable)
    subActivity: SousActivity;

    @ApiProperty({
        description: "Liste des agents validateurs du livrable",
    })
    @OneToMany(() => UserLivrable, (agentValidateur) => agentValidateur.livrable, { eager: true })
    agentValidateur: UserLivrable[];
}
