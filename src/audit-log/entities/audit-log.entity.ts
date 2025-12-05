import { ApiProperty } from "@nestjs/swagger";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from "typeorm";

@Entity({
    name: 'auditLog'
})
export class AuditLog extends Timestamp {

    @ApiProperty({
        description: "Identifiant unique du log d'audit",
        example: 1
    })
    @PrimaryGeneratedColumn()
    id: number;
  
    @ApiProperty({
        description: "Nom de la table concernée par l'action",
        example: "activity"
    })
    @Column({
        name: 'tableName',
        type: 'varchar',
        nullable: true
    })
    tableName: string;
  
    @ApiProperty({
        description: "Identifiant de l'entité affectée",
        example: 23
    })
    @Column({
        name: 'entityId',
        type: 'int',
        nullable: true
    })
    entityId: number;
  
    @ApiProperty({
        description: "Action effectuée sur l'entité",
        example: "UPDATE"
    })
    @Column({
        name: 'action',
        type: 'varchar',
        nullable: true
    })
    action: string;
  
    @ApiProperty({
        description: "Données avant la modification",
        example: { status: "En attente", budget: 2000 }
    })
    @Column({ type: 'json', nullable: true })
    oldData: any;
  
    @ApiProperty({
        description: "Données après la modification",
        example: { status: "En cours", budget: 2500 }
    })
    @Column({ type: 'json', nullable: true })
    newData: any;
  
    @ApiProperty({
        description: "ID de l'utilisateur ayant réalisé l'action",
        example: 4
    })
    @Column({
        name: 'userId',
        type: 'int',
        nullable: true
    })
    userId: number;

    @ApiProperty({
        description: "Utilisateur associé au log",
        type: () => User
    })
    @ManyToOne(() => User, (user) => user.auditable, { eager: true })
    user: User;
}
