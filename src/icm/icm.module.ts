import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IcmQuestion, IcmChecklist, IcmChecklistResponse } from './entities';
import { IcmQuestionController, IcmChecklistController, IcmDashboardController } from './controllers';
import { IcmQuestionService, IcmChecklistService, IcmDashboardService } from './services';
import { Coordination } from 'src/coordination/entities/coordination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IcmQuestion,
      IcmChecklist,
      IcmChecklistResponse,
      Coordination,
    ]),
  ],
  controllers: [IcmQuestionController, IcmChecklistController, IcmDashboardController],
  providers: [IcmQuestionService, IcmChecklistService, IcmDashboardService],
  exports: [IcmQuestionService, IcmChecklistService, IcmDashboardService],
})
export class IcmModule {}
