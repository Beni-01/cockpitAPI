import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {config} from 'dotenv'
import { ConfigService } from '@nestjs/config';

config();

const configService=new ConfigService()
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SECRET_CLE_AUTH'),
    });
  }

  validate(payload: any) {
    return payload;
  }
}
