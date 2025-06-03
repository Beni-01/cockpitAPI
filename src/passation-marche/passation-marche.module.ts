import { Module } from '@nestjs/common';
import { PassationMarcheService } from './passation-marche.service';
import { PassationMarcheController } from './passation-marche.controller';

@Module({
  controllers: [PassationMarcheController],
  providers: [PassationMarcheService],
})
export class PassationMarcheModule {}
