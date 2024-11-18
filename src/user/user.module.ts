import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserEvent } from './user.subscriber';

import { Dataformater } from 'src/utilities/data-formater.class';




@Module({
  imports:[TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserEvent, Dataformater],
  exports:[UserService]
 
})
export class UserModule {}
