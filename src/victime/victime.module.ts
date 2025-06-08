import { Module } from '@nestjs/common';
import { VictimeService } from './victime.service';
import { VictimeController } from './victime.controller';

@Module({
  controllers: [VictimeController],
  providers: [VictimeService],
})
export class VictimeModule {}
