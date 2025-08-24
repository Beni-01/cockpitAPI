import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnotationActivityDto } from './dto/create-annotation-activity.dto';
import { UpdateAnnotationActivityDto } from './dto/update-annotation-activity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnotationActivity } from './entities/annotation-activity.entity';

@Injectable()
export class AnnotationActivityService {
  constructor(
    @InjectRepository(AnnotationActivity)
    private readonly annotationRepository: Repository<AnnotationActivity>,
  ) {}

  async create(createAnnotationDto: CreateAnnotationActivityDto): Promise<AnnotationActivity> {
    const annotation = this.annotationRepository.create(createAnnotationDto);
    return this.annotationRepository.save(annotation);
  }

  async findAll(): Promise<AnnotationActivity[]> {
    return this.annotationRepository.find();
  }

  async findOne(id: number): Promise<AnnotationActivity> {
    const annotation = await this.annotationRepository.findOneBy({ id });
    if (!annotation) {
      throw new NotFoundException(`Annotation #${id} not found`);
    }
    return annotation;
  }

  async update(id: number, updateAnnotationDto: UpdateAnnotationActivityDto): Promise<AnnotationActivity> {
    const annotation = await this.annotationRepository.preload({
      id,
      ...updateAnnotationDto,
    });
    if (!annotation) {
      throw new NotFoundException(`Annotation #${id} not found`);
    }
    return this.annotationRepository.save(annotation);
  }

  async remove(id: number): Promise<void> {
    const result = await this.annotationRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Annotation #${id} not found`);
    }
  }
}
