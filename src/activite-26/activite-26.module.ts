import { Module } from '@nestjs/common';
import { Activite26Service } from './activite-26.service';
import { Activite26Controller } from './activite-26.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activite26 } from './entities/activite-26.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activite26])],
  controllers: [Activite26Controller],
  providers: [Activite26Service],
  exports: [Activite26Service],
})
export class Activite26Module {}
