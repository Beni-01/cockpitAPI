import { Injectable } from "@nestjs/common";

@Injectable()
export class Dataformater<T>{
    constructor(){}
    format(data:T, status:number,total?:number,per_page?:number,hasNext?:boolean,hasPrev?:boolean){
        return {
            data,
            status,
            total,
            per_page,
            hasNext,
            hasPrev
        }
    }
}