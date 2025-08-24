import { PartialType } from '@nestjs/swagger';
import { CreateVictimeDto } from './create-victime.dto';

export class UpdateVictimeDto extends PartialType(CreateVictimeDto) {}
