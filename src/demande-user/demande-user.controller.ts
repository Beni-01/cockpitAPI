import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DemandeUserService } from './demande-user.service';
import { CreateDemandeUserDto } from './dto/create-demande-user.dto';
import { UpdateDemandeUserDto } from './dto/update-demande-user.dto';

@Controller('demande-user')
export class DemandeUserController {
  constructor(private readonly demandeUserService: DemandeUserService) {}

  @Post()
  create(@Body() createDemandeUserDto: CreateDemandeUserDto) {
    return this.demandeUserService.create(createDemandeUserDto);
  }

  @Get()
  findAll() {
    return this.demandeUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandeUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Param('idDemande') idDemande: string, @Body() updateDemandeUserDto: UpdateDemandeUserDto) {
    return this.demandeUserService.update(+id, +idDemande, updateDemandeUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demandeUserService.remove(+id);
  }
}
