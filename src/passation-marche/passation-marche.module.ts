import { Module } from '@nestjs/common';
import { PassationMarcheService } from './passation-marche.service';
import { PassationMarcheController } from './passation-marche.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { PassationMarche } from './entities/passation-marche.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PassationMarche, User])],
  controllers: [PassationMarcheController],
  providers: [PassationMarcheService],
  exports: [PassationMarcheService],
})
export class PassationMarcheModule {}

