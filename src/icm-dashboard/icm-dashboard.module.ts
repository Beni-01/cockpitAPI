import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IcmDashboardController } from './icm-dashboard.controller';
import { IcmDashboardService } from './icm-dashboard.service';
import { IcmChecklist } from '../icm/entities/icm-checklist.entity';
import { IcmQuestion } from '../icm/entities/icm-question.entity';
import { Coordination } from '../coordination/entities/coordination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IcmChecklist, IcmQuestion, Coordination]),
  ],
  controllers: [IcmDashboardController],
  providers: [IcmDashboardService],
})
export class IcmDashboardModule {}
