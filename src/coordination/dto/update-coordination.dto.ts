import { PartialType } from '@nestjs/swagger';
import { CreateCoordinationDto } from './create-coordination.dto';

export class UpdateCoordinationDto extends PartialType(CreateCoordinationDto) {}
