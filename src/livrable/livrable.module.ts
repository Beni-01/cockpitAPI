import { Module } from '@nestjs/common';
import { LivrableService } from './livrable.service';
import { LivrableController } from './livrable.controller';

@Module({
  controllers: [LivrableController],
  providers: [LivrableService],
})
export class LivrableModule {}
