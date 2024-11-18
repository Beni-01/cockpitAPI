// sous-activity.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SousActivity } from './entities/sous-activity.entity';
import { CreateSousActivityDto } from './dto/create-sous-activity.dto';
import { UpdateSousActivityDto } from './dto/update-sous-activity.dto';


@Injectable()
export class SousActivityService {
  constructor(
    @InjectRepository(SousActivity)
    private readonly sousActivityRepository: Repository<SousActivity>
  ) {}

  // Create
  async create(createSousActivityDto: CreateSousActivityDto): Promise<SousActivity> {
    try {
      const sousActivity = this.sousActivityRepository.create(createSousActivityDto);
      return await this.sousActivityRepository.save(sousActivity);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création de la sous-activité');
    }
  }

  // Find All
  async findAll(): Promise<SousActivity[]> {
    try {
      return await this.sousActivityRepository.find({ where: { deletedAt: null } });
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la récupération des sous-activités');
    }
  }

  // Find One by ID
  async findOne(id: number): Promise<SousActivity> {
    try {
      const sousActivity = await this.sousActivityRepository.findOne({ where: { id, deletedAt: null } });
      if (!sousActivity) {
        throw new NotFoundException(`Sous-activité avec l'ID ${id} non trouvée`);
      }
      return sousActivity;
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la récupération de la sous-activité');
    }
  }

  // Update
  async update(id: number, updateSousActivityDto: UpdateSousActivityDto): Promise<SousActivity> {
    try {
      const sousActivity = await this.findOne(id);
      Object.assign(sousActivity, updateSousActivityDto);
      return await this.sousActivityRepository.save(sousActivity);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la mise à jour de la sous-activité');
    }
  }

  // Soft Delete
  async remove(id: number): Promise<SousActivity> {
    try {
      const sousActivity = await this.findOne(id);
      sousActivity.deletedAt = new Date();
      return await this.sousActivityRepository.save(sousActivity);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la suppression de la sous-activité');
    }
  }
}

