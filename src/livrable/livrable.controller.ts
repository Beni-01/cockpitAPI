import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LivrableService } from './livrable.service';
import { CreateLivrableDto } from './dto/create-livrable.dto';
import { UpdateLivrableDto } from './dto/update-livrable.dto';

@Controller('livrable')
export class LivrableController {
  constructor(private readonly livrableService: LivrableService) {}

  @Post()
  create(@Body() createLivrableDto: CreateLivrableDto) {
    return this.livrableService.create(createLivrableDto);
  }

  @Get()
  findAll() {
    return this.livrableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livrableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLivrableDto: UpdateLivrableDto) {
    return this.livrableService.update(+id, updateLivrableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.livrableService.remove(+id);
  }
}
