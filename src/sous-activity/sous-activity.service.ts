import { Injectable } from '@nestjs/common';
import { CreateSousActivityDto } from './dto/create-sous-activity.dto';
import { UpdateSousActivityDto } from './dto/update-sous-activity.dto';

@Injectable()
export class SousActivityService {
  create(createSousActivityDto: CreateSousActivityDto) {
    return 'This action adds a new sousActivity';
  }

  findAll() {
    return `This action returns all sousActivity`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sousActivity`;
  }

  update(id: number, updateSousActivityDto: UpdateSousActivityDto) {
    return `This action updates a #${id} sousActivity`;
  }

  remove(id: number) {
    return `This action removes a #${id} sousActivity`;
  }
}
