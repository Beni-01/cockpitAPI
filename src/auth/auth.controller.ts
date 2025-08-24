import { Body, Controller, Get, NotFoundException, ParseIntPipe, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';

import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  login(@Request() req: Request) {
    //console.log(' connected ', req['user'])
    return req['user'];
  }


  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refrshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @Patch('update-password')
  async setPassWord(@Body('username') username:string, @Body('oldPassword') oldPassword:string, @Body('newPassword') newPassword:string){
   return await this.authService.updatePassword(username, oldPassword, newPassword)
  }
  


}

