import { HttpStatus, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { Dataformater } from 'src/utilities/data-formater.class';

@Injectable()
export class AuthService {

  private userSecrets: { [userId: string]: string } = {};

  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
    private httpDataFormater:Dataformater<any>,
    ) {}

  async validateUser({ username, password }: AuthPayloadDto) {

    const findUser = await this.userService.findOneByUserName(username)

    if (!findUser) return null;

    if (findUser && (await bcrypt.compare(password, findUser.password))) {

      const payload = { username: findUser.username, sub: findUser }

      const token=this.jwtService.sign(payload);
      const {password, ...user}=findUser

      const customResponse={
        token,
        ...user
      }

      return this.httpDataFormater.format(customResponse, HttpStatus.OK) 
    }
  }


  async updatePassword(username:string, oldPassword:string, newPassword:string){
    try{
      const findUser = await this.userService.findOneByUserName(username)

      if (!findUser) return null;
  
      if (findUser && (await bcrypt.compare(oldPassword, findUser.password))) {
  
        const password = await bcrypt.hash(newPassword, 10);
        const userInfoUpdated={
          password
        }
        console.log('password ', userInfoUpdated)
        return await this.userService.update(findUser.username, userInfoUpdated)
      }
      else{
        console.log('erreur')
        throw new NotAcceptableException({message:' Mot de passe incorrecte !'})
      }
    }
    catch(err){
        throw new NotFoundException({message:' Mot de passe incorrecte !'})
    }

  }


  async refreshToken(user: User) {
    return {
      token: this.jwtService.sign(user),
    };
  }


}
  

