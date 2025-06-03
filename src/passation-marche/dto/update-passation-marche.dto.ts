import { PartialType } from '@nestjs/swagger';
import { CreatePassationMarcheDto } from './create-passation-marche.dto';

export class UpdatePassationMarcheDto extends PartialType(CreatePassationMarcheDto) {}
