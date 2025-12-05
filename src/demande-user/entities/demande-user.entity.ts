import { ApiProperty } from "@nestjs/swagger";
import { DemandeProlongation } from "src/demande-prolongation/entities/demande-prolongation.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";

@Entity({
    name: 'demande-user'
})
export class DemandeUser extends Timestamp {

    @ApiProperty({
        description: "Identifiant unique de la validation de demande",
        example: 1
    })
    @PrimaryGeneratedColumn()
    id: number;
    
    @ApiProperty({
        description: "ID de l'utilisateur qui valide ou rejette la demande",
        example: 4
    })
    @Column({
        name: 'userId',
        type: 'int'
    })
    userId: number;
    
    @ApiProperty({
        description: "ID de la demande de prolongation concernée",
        example: 10
    })
    @Column({
        name: 'demandeId',
        type: 'int'
    })
    demandeId: number;
    
    @ApiProperty({
        description: "Date de validation/rejet",
        example: "2025-01-12 14:30:00",
        nullable: true
    })
    @Column({
        name: 'date_validation',
        type: 'datetime',
        nullable: true
    })
    date_validation?: Date;

    @ApiProperty({
        description: "Commentaire ajouté par le validateur",
        example: "Prolongation accordée sous condition.",
        nullable: true
    })
    @Column({
        name: 'comment',
        type: 'text',
        nullable: true
    })
    comment: string;
    
    @ApiProperty({
        description: "Statut de la validation (true = validé, false = rejeté)",
        example: true,
        default: false
    })
    @Column({
        name: 'isValidate',
        type: 'boolean',
        default: false
    })
    isValidate?: boolean;
    
    @ApiProperty({
        description: "Utilisateur ayant validé/rejeté la demande",
        type: () => User
    })
    @ManyToOne(() => User, (agent) => agent.demandeUser, { eager: true })
    user: User;
    
    @ApiProperty({
        description: "Demande de prolongation liée à cette validation",
        type: () => DemandeProlongation
    })
    @ManyToOne(() => DemandeProlongation, (demande) => demande.demandeUser)
    demande: DemandeProlongation;
}
