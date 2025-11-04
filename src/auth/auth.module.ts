import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { RefreshJwtStrategy } from './strategies/refreshToken.strategy';

import {config} from 'dotenv'
import { UserModule } from 'src/user/user.module';
import { Dataformater } from 'src/utilities/data-formater.class';


config()

const configService=new ConfigService()
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global:true,
      secret: configService.get('SECRET_CLE_AUTH'),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy, ConfigService, Dataformater],
})
export class AuthModule {}
