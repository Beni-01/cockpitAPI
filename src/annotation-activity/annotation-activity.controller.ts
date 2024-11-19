import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnnotationActivityService } from './annotation-activity.service';
import { CreateAnnotationActivityDto } from './dto/create-annotation-activity.dto';
import { UpdateAnnotationActivityDto } from './dto/update-annotation-activity.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('annotation-activity')
@Controller('annotation-activity')
export class AnnotationActivityController {
  constructor(private readonly annotationActivityService: AnnotationActivityService) {}

  @Post()
  create(@Body() createAnnotationActivityDto: CreateAnnotationActivityDto) {
    return this.annotationActivityService.create(createAnnotationActivityDto);
  }

  @Get()
  findAll() {
    return this.annotationActivityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.annotationActivityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnnotationActivityDto: UpdateAnnotationActivityDto) {
    return this.annotationActivityService.update(+id, updateAnnotationActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.annotationActivityService.remove(+id);
  }
}
