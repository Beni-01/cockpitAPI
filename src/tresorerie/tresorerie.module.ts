import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TresorerieService } from './tresorerie.service';
import { TresorerieController } from './tresorerie.controller';
import { TresorerieMouvement } from './entities/tresorerie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TresorerieMouvement])],
  controllers: [TresorerieController],
  providers: [TresorerieService],
  exports: [TresorerieService],
})
export class TresorerieModule {}
