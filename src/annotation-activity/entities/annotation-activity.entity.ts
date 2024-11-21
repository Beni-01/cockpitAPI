import { ApiProperty } from "@nestjs/swagger";
import { Activity } from "src/activity/entities/activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";

@Entity({
    name: 'annotationActivity'
})
export class AnnotationActivity extends Timestamp {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: "ID de l'annotation" })
    id: number;

    @Column({
        name:'type',
        type:'varchar',
        nullable:true,
        default:'COMMENTAIRE'
    })
    type:string

    @Column({
        name: 'text',
        type: 'text'
    })
    @ApiProperty({ description: "Texte de l'annotation" })
    text: string;

    @Column({
        name: 'activityId',
        type: 'int'
    })
    @ApiProperty({ description: "ID du conflit associé à l'annotation" })
    activityId: number;

    @Column({
        name: 'userId',
        type: 'int'
    })
    @ApiProperty({ description: "ID de l'utilisateur associé à l'annotation" })
    userId: number;

    @ManyToOne(() =>Activity, (activity) => activity.annotations)
    @ApiProperty({ description: "Conflit associé à l'annotation" })
    activity: Activity;

    @ManyToOne(() => User, (user) => user.annotations, { eager: true })
    user: User;
}
