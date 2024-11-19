import { PartialType } from '@nestjs/swagger';
import { CreateAnnotationActivityDto } from './create-annotation-activity.dto';

export class UpdateAnnotationActivityDto extends PartialType(CreateAnnotationActivityDto) {}
