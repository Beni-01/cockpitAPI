import { Injectable } from '@nestjs/common';
import { CreateDemandeProlongationDto } from './dto/create-demande-prolongation.dto';
import { UpdateDemandeProlongationDto } from './dto/update-demande-prolongation.dto';

@Injectable()
export class DemandeProlongationService {
  create(createDemandeProlongationDto: CreateDemandeProlongationDto) {
    return 'This action adds a new demandeProlongation';
  }

  findAll() {
    return `This action returns all demandeProlongation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} demandeProlongation`;
  }

  update(id: number, updateDemandeProlongationDto: UpdateDemandeProlongationDto) {
    return `This action updates a #${id} demandeProlongation`;
  }

  remove(id: number) {
    return `This action removes a #${id} demandeProlongation`;
  }
}
