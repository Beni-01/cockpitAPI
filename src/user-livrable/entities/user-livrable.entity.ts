import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Livrable } from "src/livrable/entities/livrable.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";

@Entity({
    name:'user-livrable'
})
export class UserLivrable extends Timestamp {

    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'ID unique de l’utilisateur-livrable' })
    id: number;

    @Column({ type:'int' })
    @ApiProperty({ description: 'ID de l’utilisateur associé' })
    userId: number;

    @Column({ type:'int' })
    @ApiProperty({ description: 'ID du livrable associé' })
    livrableId: number;

    @Column({ type:'datetime', nullable:true })
    @ApiPropertyOptional({ description: 'Date de validation du livrable' })
    date_validation?: Date;

    @Column({ type:'text', nullable:true })
    @ApiPropertyOptional({ description: 'Commentaire associé à la validation' })
    comment?: string;

    @Column({ type:'boolean', default:false })
    @ApiProperty({ description: 'Indique si le livrable est validé' })
    isValidate?: boolean;

    @ManyToOne(() => User, (agent) => agent.agentValidateur, { eager: true })
    @ApiProperty({ description: 'Utilisateur lié à ce livrable' })
    user: User;

    @ManyToOne(() => Livrable, (livrable) => livrable.agentValidateur)
    @ApiProperty({ description: 'Livrable associé à l’utilisateur' })
    livrable: Livrable;
}
