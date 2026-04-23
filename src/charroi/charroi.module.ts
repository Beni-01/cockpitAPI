import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charroi } from './entities/charroi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Charroi])],
  exports: [TypeOrmModule],
})
export class CharroiModule {}
