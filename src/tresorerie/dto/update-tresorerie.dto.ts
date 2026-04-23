import { PartialType } from '@nestjs/swagger';
import { CreateTresorerieDto } from './create-tresorerie.dto';

export class UpdateTresorerieDto extends PartialType(CreateTresorerieDto) {}
