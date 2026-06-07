import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IcmChecklist,
  IcmChecklistResponse,
  IcmQuestion,
  IcmTache,
  IcmTacheLivrable,
} from './entities';
import {
  IcmChecklistController,
  IcmDashboardController,
  IcmQuestionController,
  IcmTacheController,
} from './controllers';
import {
  IcmChecklistService,
  IcmDashboardService,
  IcmQuestionService,
  IcmTacheService,
} from './services';
import { Coordination } from 'src/coordination/entities/coordination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IcmQuestion,
      IcmTache,
      IcmTacheLivrable,
      IcmChecklist,
      IcmChecklistResponse,
      Coordination,
    ]),
  ],
  controllers: [
    IcmQuestionController,
    IcmTacheController,
    IcmChecklistController,
    IcmDashboardController,
  ],
  providers: [
    IcmQuestionService,
    IcmTacheService,
    IcmChecklistService,
    IcmDashboardService,
  ],
  exports: [
    IcmQuestionService,
    IcmTacheService,
    IcmChecklistService,
    IcmDashboardService,
  ],
})
export class IcmModule {}
