import { Module } from '@nestjs/common';
import { LivrableService } from './livrable.service';
import { LivrableController } from './livrable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livrable } from './entities/livrable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Livrable]), // Import de l'entité Livrable pour TypeORM
  ],
  controllers: [LivrableController],
  providers: [LivrableService],
})
export class LivrableModule {}
