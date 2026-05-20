import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SatviQuestionnaire } from './entities/satvi-questionnaire.entity';
import { SatviController } from './satvi.controller';
import { SatviService } from './satvi.service';

@Module({
  imports: [TypeOrmModule.forFeature([SatviQuestionnaire])],
  controllers: [SatviController],
  providers: [SatviService],
  exports: [SatviService],
})
export class SatviModule {}
