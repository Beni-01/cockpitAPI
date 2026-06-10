import { BadRequestException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Dataformater } from 'src/utilities/data-formater.class';



@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private httpDataFormater:Dataformater<any>,

    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    async importUserCreation(createUserDtos: CreateUserDto[]): Promise<User[]> {
        const users: User[] = [];
      
        try {
          for (const createUserDto of createUserDtos) {

            const user = this.userRepository.create(createUserDto);      
            users.push(await this.userRepository.save(user));
          }
      
          return users; 
        } catch (err) {
          throw new BadRequestException(`Une erreur est survenue lors de l'importation des users :  ${err}`);
        }
      }


      async getUsersByFunction(): Promise<any> {
        const query =`
      SELECT user.id, user.nom, user.postnom, user.prenom, user.email, user.sexe, fonction.id AS fonctionId, fonction.fonction
      FROM user
      INNER JOIN fonction ON user.fonctionId = fonction.id
      WHERE fonction.fonction IN ('directeur financier','directeur général','controleur de gestion','Directeur général adjoint chargé des opérations', 'directeur général adjoint administration et finances', 'responsable audit');
      `;
  
    const validateurOrder:any=[];
    const validateurs= await this.userRepository.query(query);
  

        validateurOrder[0]=validateurs.find((value:any)=>value.fonction.toLowerCase().includes('chargé des opérations'))
        validateurOrder[1]=validateurs.find((value:any)=>value.fonction.toLowerCase().includes('directeur général adjoint administration et finances'))
        validateurOrder[2]=validateurs.find((value:any)=>value.fonction.toLowerCase()=='directeur général')

        return  this.httpDataFormater.format(validateurOrder, HttpStatus.OK)
    
      }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findSupervisor(): Promise<User[]> {
        return await this.userRepository.find({
            where:{
                isSupervisor:true
            }
        });
    }

    async findAgent(): Promise<User[]> {
        return await this.userRepository.find({
            where:{
                isSupervisor:false
            }
        });
    }

    async findOneByUserName(username:string):Promise<User>{
      
      try{
         const user = await this.userRepository.findOne({ where: { username, status:true } });    
         return user

      }
      catch(err){
        throw new UnauthorizedException()
      }
    
    }
    
    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(username: string, updateUserDto: UpdateUserDto): Promise<User> {
        try{
            console.log('update username ', username)
        const user=await this.findOneByUserName(username);
          console.log('update ', user)
        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }
        await this.userRepository.update(user.id, updateUserDto);
        return this.findOne(user.id);
        }
        catch(err){
            throw new BadRequestException(`Une erreur est survenue lors de la mise à jour de l'utilisateur : ${err.message}`);
        }

    }

    async softRemove(id: number): Promise<void> {
        const result = await this.userRepository.softDelete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    async restore(id: number): Promise<void> {
        const result = await this.userRepository.restore(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    // Access Forms

}
