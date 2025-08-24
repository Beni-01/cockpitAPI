import { PartialType } from '@nestjs/swagger';
import { CreateUserLivrableDto } from './create-user-livrable.dto';

export class UpdateUserLivrableDto extends PartialType(CreateUserLivrableDto) {}
