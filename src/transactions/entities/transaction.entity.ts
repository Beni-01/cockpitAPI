import { Budget } from "src/budget/entities/budget.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: 'transaction'
})
export class Transaction extends Timestamp {

    @PrimaryGeneratedColumn({
        comment: 'Identifiant unique de la transaction'
    })
    id: number;

    @Column({
        name: 'depense',
        type: 'decimal',
        precision: 20,
        scale: 2,
        nullable: true,
        comment: 'Montant réel de la dépense après ajustements ou conversions (Toujours en USD)'
    })
    depense: number;


    @Column({
        name: 'devise',
        type: 'varchar',
        nullable: false,
        default: 'USD',
        comment: 'Devise d’origine de la transaction (ex: USD, CDF, EUR)'
    })
    devise: string;

    @Column({
        name: 'depense_init',
        type: 'decimal',
        precision: 20,
        scale: 2,
        nullable: true,
        comment: 'Montant initial de la dépense avant conversion'
    })
    depense_init: number;


    @Column({
        name: 'devise_convert',
        type: 'varchar',
        nullable: false,
        default: 'USD',
        comment: 'Devise après conversion si applicable'
    })
    devise_convert: string;

    @Column({
        name: 'description',
        type: 'text',
        nullable: true,
        comment: 'Description détaillée de la transaction'
    })
    description: string;

    @Column({
        name: 'ref',
        type: 'varchar',
        nullable: true,
        comment: 'Référence externe ou interne de la transaction'
    })
    ref: string;

    @Column({
        name: 'agent',
        type: 'varchar',
        nullable: true,
        comment: 'Nom de l’agent ayant effectué la transaction'
    })
    agent: string;

    @Column({
        name: 'centreId',
        type: 'int',
        nullable: true,
        comment: 'Identifiant du centre budgétaire lié à la transaction'
    })
    centreId: number;

    @ManyToOne(
        () => Budget,
        (centre) => centre.transactions,
        {
            nullable: true
        }
    )
    centre: Budget;
}
