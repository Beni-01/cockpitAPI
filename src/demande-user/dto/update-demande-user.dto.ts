import { PartialType } from '@nestjs/swagger';
import { CreateDemandeUserDto } from './create-demande-user.dto';

export class UpdateDemandeUserDto extends PartialType(CreateDemandeUserDto) {}
