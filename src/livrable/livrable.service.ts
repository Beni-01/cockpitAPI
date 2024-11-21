import { Injectable } from '@nestjs/common';
import { CreateLivrableDto } from './dto/create-livrable.dto';
import { UpdateLivrableDto } from './dto/update-livrable.dto';

@Injectable()
export class LivrableService {
  create(createLivrableDto: CreateLivrableDto) {
    return 'This action adds a new livrable';
  }

  findAll() {
    return `This action returns all livrable`;
  }

  findOne(id: number) {
    return `This action returns a #${id} livrable`;
  }

  update(id: number, updateLivrableDto: UpdateLivrableDto) {
    return `This action updates a #${id} livrable`;
  }

  remove(id: number) {
    return `This action removes a #${id} livrable`;
  }
}
