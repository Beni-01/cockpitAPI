import { PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Entity } from "typeorm";
import { User } from "./user.entity";
import { Timestamp } from "src/timestime-entity/timestamp.entity";


@Entity({
    name:'user_form'
})
export class UserForms extends Timestamp {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        name:'form',
        type:'varchar'
    })
    form:string;


    @Column({
        name:'userId',
        type:'int'
    })
    userId:number

    @ManyToOne(()=>User, (user)=>user.forms)
    user:User


}
