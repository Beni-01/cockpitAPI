import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ApexInputController from './apex-input.controller';
import { ApexInputService } from './apex-input.service';
import { ApexInput } from './apex-input.entity';
import { Budget } from '../budget/entities/budget.entity';
import { Department } from '../department/entities/department.entity';
import { BudgetActivity } from '../budget/entities/budget-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApexInput, Budget, Department, BudgetActivity])],
  controllers: [ApexInputController],
  providers: [ApexInputService],
  exports: [ApexInputService],
})
export class ApexInputModule {}

export default ApexInputModule;
