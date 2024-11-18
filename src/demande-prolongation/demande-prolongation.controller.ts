import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DemandeProlongationService } from './demande-prolongation.service';
import { CreateDemandeProlongationDto } from './dto/create-demande-prolongation.dto';
import { UpdateDemandeProlongationDto } from './dto/update-demande-prolongation.dto';

@Controller('demande-prolongation')
export class DemandeProlongationController {
  constructor(private readonly demandeProlongationService: DemandeProlongationService) {}

  @Post()
  create(@Body() createDemandeProlongationDto: CreateDemandeProlongationDto) {
    return this.demandeProlongationService.create(createDemandeProlongationDto);
  }

  @Get()
  findAll() {
    return this.demandeProlongationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandeProlongationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDemandeProlongationDto: UpdateDemandeProlongationDto) {
    return this.demandeProlongationService.update(+id, updateDemandeProlongationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demandeProlongationService.remove(+id);
  }
}
