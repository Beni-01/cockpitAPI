import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { Activity } from 'src/activity/entities/activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { Livrable } from 'src/livrable/entities/livrable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coordination,
      Activity,
      SousActivity,
      Livrable
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
