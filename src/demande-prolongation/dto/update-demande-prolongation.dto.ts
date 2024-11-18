import { PartialType } from '@nestjs/swagger';
import { CreateDemandeProlongationDto } from './create-demande-prolongation.dto';

export class UpdateDemandeProlongationDto extends PartialType(CreateDemandeProlongationDto) {}
