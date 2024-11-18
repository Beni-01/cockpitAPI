import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { User } from "./entities/user.entity";
import { Logger } from "@nestjs/common";

@EventSubscriber()
export class UserEvent implements EntitySubscriberInterface<User>{
    private readonly logger= new Logger(UserEvent.name)

    constructor(data:DataSource){
        data.subscribers.push(this)
    }

    listenTo(): string | Function {
        return User
    }

  beforeInsert(event: InsertEvent<User>): void | Promise<any> {
      this.logger.log('before insert user ', JSON.stringify(event.entity))
  }

  afterInsert(event: InsertEvent<User>): void | Promise<any> {
    this.logger.log('after insert user ', JSON.stringify(event.entity))
  }


   
}
