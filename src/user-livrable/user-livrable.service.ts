import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserLivrableDto } from './dto/create-user-livrable.dto';
import { UpdateUserLivrableDto } from './dto/update-user-livrable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataformater } from 'src/utilities/data-formater.class';
import { Repository } from 'typeorm';
import { UserLivrable } from './entities/user-livrable.entity';

@Injectable()
export class UserLivrableService {
  constructor(
    private dataFormeter: Dataformater<any>,
    @InjectRepository(UserLivrable) private readonly agentValidateurRepository:Repository<UserLivrable>
  ){

  }

  async create(createAgentValidateurDto: CreateUserLivrableDto) {
   try{
     const validateur=this.agentValidateurRepository.create(createAgentValidateurDto)
     return  await this.agentValidateurRepository.save(validateur)
   }
   catch{
    throw new BadRequestException()
   }
  }

  findAll() {
    return `This action returns all agentValidateur`;
  }

  async findOne(id: number) {
    try{
      const validateur=this.agentValidateurRepository.findOneOrFail({
        where:{
          id:id,
        }
      })
      return await validateur
    }
    catch{
     throw new NotFoundException()
    }
  }

  async findOneAgent(id: number, idLivrable:number) {
    try{
      const validateur=this.agentValidateurRepository.findOneOrFail({
        where:{
          userId:id,
          livrableId:idLivrable
        }
      })
      return await validateur
    }
    catch{
     throw new NotFoundException()
    }
  }

  async update(idAgent: number, idLivrable:number,  updateAgentValidateurDto: UpdateUserLivrableDto) {
    try{
       const formCheck=await this.findOneAgent(idAgent, idLivrable);
       const {id, ...result}=formCheck

       console.log(' yes ', formCheck)

       const validateur={
         id,
         ...updateAgentValidateurDto

       }
        return await this.agentValidateurRepository.save(validateur)  
      }
  
     catch{
      throw new NotFoundException()
     }
  }

  remove(id: number) {
    return `This action removes a #${id} agentValidateur`;
  }
}
