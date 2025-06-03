import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PassationMarcheService } from './passation-marche.service';
import { CreatePassationMarcheDto } from './dto/create-passation-marche.dto';
import { UpdatePassationMarcheDto } from './dto/update-passation-marche.dto';

@Controller('passation-marche')
export class PassationMarcheController {
  constructor(private readonly passationMarcheService: PassationMarcheService) {}

  @Post()
  create(@Body() createPassationMarcheDto: CreatePassationMarcheDto) {
    return this.passationMarcheService.create(createPassationMarcheDto);
  }

  @Get()
  findAll() {
    return this.passationMarcheService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passationMarcheService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePassationMarcheDto: UpdatePassationMarcheDto) {
    return this.passationMarcheService.update(+id, updatePassationMarcheDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passationMarcheService.remove(+id);
  }
}
