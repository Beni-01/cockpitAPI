import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";


@Entity({
    name: 'activite_26'
})
@Index(['direction'])
export class Activite26 extends Timestamp{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text',
        name: 'objectif',
    })
    objectif: string;

    @Column({
        type: 'text',
        name: 'activite',
    })
    activite: string;

    @Column({
        type: 'varchar',
        name: 'T1'
    })
    T1:string;

    @Column({
        type: 'varchar',
        name: 'T2',
    })
    T2:string;

    @Column({
        type: 'varchar',
        name: 'T3',
    })
    T3:string;

    @Column({
        type: 'varchar',
        name: 'T4',
    })
    T4:string;

    @Column({
        default:'En attente',
        type: 'varchar',
        name: 'status',

    })
    status:string

    @Column({
        type:'decimal',
        name: 'budget',
        scale: 2,
        precision: 20,  
    })
    budget: number;

    @Column({
        type: 'varchar',
        name: 'direction',
    })
    direction: string;

    @Column({
        type: 'text',
        name: 'observation',
    })
    observation: string;
}
