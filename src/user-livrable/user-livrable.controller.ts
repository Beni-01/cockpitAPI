import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserLivrableService } from './user-livrable.service';
import { CreateUserLivrableDto } from './dto/create-user-livrable.dto';
import { UpdateUserLivrableDto } from './dto/update-user-livrable.dto';

@Controller('user-livrable')
export class UserLivrableController {
  constructor(private readonly userLivrableService: UserLivrableService) {}

  @Post()
  create(@Body() createUserLivrableDto: CreateUserLivrableDto) {
    return this.userLivrableService.create(createUserLivrableDto);
  }

  @Get()
  findAll() {
    return this.userLivrableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userLivrableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Param('idLivrable') idLivrable: string, @Body() updateUserLivrableDto: UpdateUserLivrableDto) {
    return this.userLivrableService.update(+id, +idLivrable, updateUserLivrableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userLivrableService.remove(+id);
  }
}

