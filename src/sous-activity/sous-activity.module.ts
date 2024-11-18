import { Module } from '@nestjs/common';
import { SousActivityService } from './sous-activity.service';
import { SousActivityController } from './sous-activity.controller';

@Module({
  controllers: [SousActivityController],
  providers: [SousActivityService],
})
export class SousActivityModule {}
