
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BeforeInsert } from 'typeorm/decorator/listeners/BeforeInsert';
import * as bcrypt from 'bcrypt';


export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  nom:string;

  @IsString()
  @IsOptional()
  postnom:string;

  @IsString()
  @IsOptional()
  prenom:string;

  @IsString()
  @IsNotEmpty()
  sexe: string;

  @IsOptional()
  telephone:string;

  @IsNumber()
  @IsOptional()
  directionId:number;

  @IsNumber()
  @IsOptional()
  directionGeneraleId:number

  @IsString()
  @IsOptional()
  direction?:string;

  @IsString()
  @IsOptional()
  fonction?:string;

  @IsString()
  @IsOptional()
  grade?:string;

  @IsOptional()
  @IsNumber()
  directeurId?:number;

  @IsOptional()
  @IsNumber()
  agentDelegueId?:number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsBoolean()
  @IsOptional()
  isSupervisor:boolean

  @IsOptional()
  otp?: string;

  @IsString()
  password:string;

  @IsEmail()
  email:string;

  @IsOptional()
  @IsBoolean()
  isActivate:boolean=false

  @IsOptional()
  signature?:string;

  @IsOptional()
  @IsBoolean()
  status:boolean=true

  @BeforeInsert()
  async hashPasword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

}







