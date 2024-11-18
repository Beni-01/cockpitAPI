import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserForms } from './entities/contrat.entity';
import { CreateAccessFormsDto } from './dto/create-access.dto';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(UserForms)
        private userFormsRepository: Repository<UserForms>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
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
        console.log('update username ', username)
        const user=await this.findOneByUserName(username);
          console.log('update ', user)
        await this.userRepository.update(user.id, updateUserDto);
        return this.findOne(user.id);
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

    async createForms(createAccessFormsDto: CreateAccessFormsDto): Promise<UserForms> {
        const userForm = this.userFormsRepository.create(createAccessFormsDto);
        return this.userFormsRepository.save(userForm);
    }

    async findAllForms(): Promise<UserForms[]> {
        return this.userFormsRepository.find();
    }

    async findOneForm(id: number): Promise<UserForms> {
        const userForm = await this.userFormsRepository.findOneBy({ id });
        if (!userForm) {
            throw new NotFoundException(`Form with ID ${id} not found`);
        }
        return userForm;
    }

    async updateForms(id: number, updateAccessFormsDto: Partial<CreateAccessFormsDto>): Promise<UserForms> {
        await this.userFormsRepository.update(id, updateAccessFormsDto);
        return this.findOneForm(id);
    }

    async removeForms(id: number): Promise<void> {
        const result = await this.userFormsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Form with ID ${id} not found`);
        }
    }
}
