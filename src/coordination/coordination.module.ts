import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordination } from './entities/coordination.entity';
import { CoordinationService } from './coordination.service';
import { CoordinationController } from './coordination.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coordination])],
  controllers: [CoordinationController],
  providers: [CoordinationService],
  exports: [CoordinationService],
})
export class CoordinationModule {}
