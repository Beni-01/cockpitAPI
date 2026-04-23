import { ApiProperty } from "@nestjs/swagger";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: 'user_activies_assignment'
})
export class UserActivitiesAssignment extends Timestamp {

    @ApiProperty({ description: "ID unique de l'assignation" })
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    @ApiProperty({ description: "ID de l'utilisateur associé" })
    userId: number;

    @Column({ type: 'int', nullable: false })
    @ApiProperty({ description: "ID de la sous-activité associée" })
    sousActivityId: number;

    // ── Relations ──────────────────────────────────────────────────────────

    /**
     * Côté propriétaire : ManyToOne ne prend PAS @JoinColumn
     * (TypeORM l'infère automatiquement depuis la colonne userId)
     */
    @ManyToOne(() => User, (user) => user.userActivitiesAssignments, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @ApiProperty({ description: "Utilisateur associé" })
    user: User;

    @ManyToOne(() => SousActivity, (sousActivity) => sousActivity.userActivitiesAssignments, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @ApiProperty({ description: "Sous-activité associée" })
    sousActivity: SousActivity;
}
