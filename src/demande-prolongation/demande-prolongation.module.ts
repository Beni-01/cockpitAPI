import { Module } from '@nestjs/common';
import { DemandeProlongationService } from './demande-prolongation.service';
import { DemandeProlongationController } from './demande-prolongation.controller';

@Module({
  controllers: [DemandeProlongationController],
  providers: [DemandeProlongationService],
})
export class DemandeProlongationModule {}
