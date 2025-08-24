import { PartialType } from '@nestjs/swagger';
import { CreateSousActivityDto } from './create-sous-activity.dto';

export class UpdateSousActivityDto extends PartialType(CreateSousActivityDto) {}
