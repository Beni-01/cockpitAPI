import { PartialType } from '@nestjs/swagger';
import { CreateAntenneDto } from './create-antenne.dto';

export class UpdateAntenneDto extends PartialType(CreateAntenneDto) {}
