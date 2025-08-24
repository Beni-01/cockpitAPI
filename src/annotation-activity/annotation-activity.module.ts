import { Module } from '@nestjs/common';
import { AnnotationActivityService } from './annotation-activity.service';
import { AnnotationActivityController } from './annotation-activity.controller';
import { AnnotationActivity } from './entities/annotation-activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([AnnotationActivity])],
  controllers: [AnnotationActivityController],
  providers: [AnnotationActivityService],
})
export class AnnotationActivityModule {}
