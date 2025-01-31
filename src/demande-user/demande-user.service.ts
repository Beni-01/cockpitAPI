import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDemandeUserDto } from './dto/create-demande-user.dto';
import { UpdateDemandeUserDto } from './dto/update-demande-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataformater } from 'src/utilities/data-formater.class';
import { Repository } from 'typeorm';
import { DemandeUser } from './entities/demande-user.entity';

@Injectable()
export class DemandeUserService {
constructor(
    private dataFormeter: Dataformater<any>,
    @InjectRepository(DemandeUser) private readonly agentValidateurRepository:Repository<DemandeUser>
  ){

  }

  async create(createAgentValidateurDto: CreateDemandeUserDto) {
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

  async findOneAgent(id: number, idDemande:number) {
    try{
      const validateur=this.agentValidateurRepository.findOneOrFail({
        where:{
          userId:id,
          demandeId:idDemande
        }
      })
      return await validateur
    }
    catch{
     throw new NotFoundException()
    }
  }

  async update(idAgent: number, idLivrable:number,  updateAgentValidateurDto: UpdateDemandeUserDto) {
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
