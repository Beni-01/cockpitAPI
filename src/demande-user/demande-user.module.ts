import { Module } from '@nestjs/common';
import { DemandeUserService } from './demande-user.service';
import { DemandeUserController } from './demande-user.controller';
import { Dataformater } from 'src/utilities/data-formater.class';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeUser } from './entities/demande-user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([DemandeUser])],
  controllers: [DemandeUserController],
  providers: [DemandeUserService,  Dataformater],
  exports:[DemandeUserService]
})
export class DemandeUserModule {}
