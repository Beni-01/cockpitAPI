import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SousActivityService } from './sous-activity.service';
import { CreateSousActivityDto } from './dto/create-sous-activity.dto';
import { UpdateSousActivityDto } from './dto/update-sous-activity.dto';

@Controller('sous-activity')
export class SousActivityController {
  constructor(private readonly sousActivityService: SousActivityService) {}

  @Post()
  create(@Body() createSousActivityDto: CreateSousActivityDto) {
    return this.sousActivityService.create(createSousActivityDto);
  }

  @Get()
  findAll() {
    return this.sousActivityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sousActivityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSousActivityDto: UpdateSousActivityDto) {
    return this.sousActivityService.update(+id, updateSousActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sousActivityService.remove(+id);
  }
}
