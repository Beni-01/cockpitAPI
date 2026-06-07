import { PartialType } from '@nestjs/swagger';
import { CreateIcmTacheDto } from './create-icm-tache.dto';

export class UpdateIcmTacheDto extends PartialType(CreateIcmTacheDto) {}
