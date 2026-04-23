import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectCopir } from './entities/project-copir.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectCopir])],
  exports: [TypeOrmModule],
})
export class ProjectCopirModule {}
