import { Module } from '@nestjs/common';
import { DemandeProlongationService } from './demande-prolongation.service';
import { DemandeProlongationController } from './demande-prolongation.controller';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeProlongation } from './entities/demande-prolongation.entity';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandeProlongation, User]), // Ajouter DemandeProlongation ici
    ActivityModule
  ],
  controllers: [DemandeProlongationController],
  providers: [DemandeProlongationService],
})
export class DemandeProlongationModule {}
