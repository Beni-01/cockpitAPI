import { Injectable } from '@nestjs/common';
import { CreateVictimeDto } from './dto/create-victime.dto';
import { UpdateVictimeDto } from './dto/update-victime.dto';

@Injectable()
export class VictimeService {
  create(createVictimeDto: CreateVictimeDto) {
    return 'This action adds a new victime';
  }

  findAll() {
    return `This action returns all victime`;
  }

  findOne(id: number) {
    return `This action returns a #${id} victime`;
  }

  update(id: number, updateVictimeDto: UpdateVictimeDto) {
    return `This action updates a #${id} victime`;
  }

  remove(id: number) {
    return `This action removes a #${id} victime`;
  }
}
