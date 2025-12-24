import { Module } from '@nestjs/common';
import { DisbursementService } from './disbursement.service';
import { DisbursementController } from './disbursement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Disbursement } from './entities/disbursement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disbursement])],
  controllers: [DisbursementController],
  providers: [DisbursementService],
})
export class DisbursementModule {}
