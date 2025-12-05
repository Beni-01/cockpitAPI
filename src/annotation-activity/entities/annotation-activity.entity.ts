import { ApiProperty } from "@nestjs/swagger";
import { Activity } from "src/activity/entities/activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";

@Entity({
    name: 'annotationActivity'
})
export class AnnotationActivity extends Timestamp {

    @ApiProperty({
        description: "Identifiant unique de l'annotation",
        example: 1
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: "Type de l'annotation",
        example: "COMMENTAIRE",
        default: "COMMENTAIRE"
    })
    @Column({
        name:'type',
        type:'varchar',
        nullable:true,
        default:'COMMENTAIRE'
    })
    type: string;

    @ApiProperty({
        description: "Texte complet de l'annotation",
        example: "Le livrable doit être mis à jour avant le 15 janvier."
    })
    @Column({
        name: 'text',
        type: 'text'
    })
    text: string;

    @ApiProperty({
        description: "ID de l'activité liée à cette annotation",
        example: 12
    })
    @Column({
        name: 'activityId',
        type: 'int'
    })
    activityId: number;

    @ApiProperty({
        description: "ID de l'utilisateur ayant ajouté l'annotation",
        example: 5
    })
    @Column({
        name: 'userId',
        type: 'int'
    })
    userId: number;

    @ApiProperty({
        description: "Activité associée à l'annotation",
        type: () => Activity
    })
    @ManyToOne(() => Activity, (activity) => activity.annotations)
    activity: Activity;

    @ApiProperty({
        description: "Utilisateur ayant créé l'annotation",
        type: () => User
    })
    @ManyToOne(() => User, (user) => user.annotations, { eager: true })
    user: User;
}
