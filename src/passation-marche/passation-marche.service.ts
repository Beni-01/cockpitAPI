import { Injectable } from '@nestjs/common';
import { CreatePassationMarcheDto } from './dto/create-passation-marche.dto';
import { UpdatePassationMarcheDto } from './dto/update-passation-marche.dto';

@Injectable()
export class PassationMarcheService {
  create(createPassationMarcheDto: CreatePassationMarcheDto) {
    return 'This action adds a new passationMarche';
  }

  findAll() {
    return `This action returns all passationMarche`;
  }

  findOne(id: number) {
    return `This action returns a #${id} passationMarche`;
  }

  update(id: number, updatePassationMarcheDto: UpdatePassationMarcheDto) {
    return `This action updates a #${id} passationMarche`;
  }

  remove(id: number) {
    return `This action removes a #${id} passationMarche`;
  }
}
