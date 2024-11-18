import { Module } from '@nestjs/common';
import { DemandeProlongationService } from './demande-prolongation.service';
import { DemandeProlongationController } from './demande-prolongation.controller';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeProlongation } from './entities/demande-prolongation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandeProlongation, User]), // Ajouter DemandeProlongation ici
  ],
  controllers: [DemandeProlongationController],
  providers: [DemandeProlongationService],
})
export class DemandeProlongationModule {}
