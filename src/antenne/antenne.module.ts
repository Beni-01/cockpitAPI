import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Antenne } from './entities/antenne.entity';
import { AntenneService } from './antenne.service';
import { AntenneController } from './antenne.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Antenne])],
  controllers: [AntenneController],
  providers: [AntenneService],
  exports: [AntenneService],
})
export class AntenneModule {}
