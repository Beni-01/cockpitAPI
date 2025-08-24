import { Module } from '@nestjs/common';
import { UserLivrableService } from './user-livrable.service';
import { UserLivrableController } from './user-livrable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLivrable } from './entities/user-livrable.entity';
import { Dataformater } from 'src/utilities/data-formater.class';

@Module({
  imports:[TypeOrmModule.forFeature([UserLivrable])],
  controllers: [UserLivrableController],
  providers: [UserLivrableService, Dataformater],
  exports:[UserLivrableService]
})
export class UserLivrableModule {}
