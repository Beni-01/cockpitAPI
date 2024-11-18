import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserEvent } from './user.subscriber';

import { Dataformater } from 'src/utilities/data-formater.class';
import { UserForms } from './entities/contrat.entity';



@Module({
  imports:[TypeOrmModule.forFeature([User, UserForms ])],
  controllers: [UserController],
  providers: [UserService, UserEvent, Dataformater],
  exports:[UserService]
 
})
export class UserModule {}
