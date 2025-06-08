import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VictimeService } from './victime.service';
import { CreateVictimeDto } from './dto/create-victime.dto';
import { UpdateVictimeDto } from './dto/update-victime.dto';

@Controller('victime')
export class VictimeController {
  constructor(private readonly victimeService: VictimeService) {}

  @Post()
  create(@Body() createVictimeDto: CreateVictimeDto) {
    return this.victimeService.create(createVictimeDto);
  }

  @Get()
  findAll() {
    return this.victimeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.victimeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVictimeDto: UpdateVictimeDto) {
    return this.victimeService.update(+id, updateVictimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.victimeService.remove(+id);
  }
}
