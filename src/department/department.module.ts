import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { MappingCashFlow } from 'src/budget/entities/mapping-cashflow.entity';
import { BudgetActivity } from 'src/budget/entities/budget-activity.entity';
import { BudgetSousActivity } from 'src/budget/entities/budget-sous-activity.entity';
import { BudgetTache } from 'src/budget/entities/budget-tache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Department,
      MappingCashFlow,
      BudgetActivity,
      BudgetSousActivity,
      BudgetTache,
    ]),
  ],
  providers: [DepartmentService],
  controllers: [DepartmentController],
  exports: [DepartmentService],
})
export class DepartmentModule {}
