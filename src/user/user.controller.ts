import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

import { ApiTags } from '@nestjs/swagger';


@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get("agent/supervisor")
  findAllSupervisor() {
    return this.userService.findSupervisor();
  }

  @Get("agent/enqueteur")
  findAllCollector() {
    return this.userService.findAgent();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }


  @Get('username/:username')
  findOneByUsername(@Param('username') username: string) {
    return this.userService.findOneByUserName(username);
  }


  @Patch('update/:username')
  update(@Param('username') username: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(username, updateUserDto);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.softRemove(+id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    console.log('Inside AuthController status methods');
    console.log(' Je suis dans auth ', req['user']);
    return req['user'];
  }






}
