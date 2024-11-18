
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BeforeInsert } from 'typeorm/decorator/listeners/BeforeInsert';
import * as bcrypt from 'bcrypt';


export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  nom:string;

  @IsString()
  @IsNotEmpty()
  postnom:string;

  @IsString()
  @IsNotEmpty()
  prenom:string;

  @IsString()
  @IsNotEmpty()
  sexe: string;

  @IsOptional()
  telephone:string;

  @IsNumber()
  @IsOptional()
  directionId:number;

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
  directeurId?:number;

  @IsOptional()
  agentDelegueId?:number;

  @IsNumber()
  fonctionId:number;

  @IsNumber()
  gradeId:number;

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







