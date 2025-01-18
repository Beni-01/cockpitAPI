// sous-activity.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SousActivity } from './entities/sous-activity.entity';
import { CreateSousActivityDto } from './dto/create-sous-activity.dto';
import { UpdateSousActivityDto } from './dto/update-sous-activity.dto';
import { ActivityService } from 'src/activity/activity.service';
import { UpdateActivityDto } from 'src/activity/dto/update-activity.dto';
import { CreateActivityDto } from 'src/activity/dto/create-activity.dto';


@Injectable()
export class SousActivityService {
  constructor(
    @InjectRepository(SousActivity)
    private readonly sousActivityRepository: Repository<SousActivity>,

    private readonly activityRepository:ActivityService
  ) {}

  // Create
  async create(createSousActivityDto: CreateSousActivityDto): Promise<SousActivity> {
    try {
      const { livrable, ...subActivityData } = createSousActivityDto;
      const sousActivity = this.sousActivityRepository.create(subActivityData);
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

  // // Update
  // async update(id: number, idActivity: number, updateSousActivityDto: UpdateSousActivityDto): Promise<SousActivity> {
  //   try {


  //     const budgeConsomme=updateSousActivityDto.budgetConsomme

  //     const sousActivity = await this.findOne(id);
  //     Object.assign(sousActivity, updateSousActivityDto);
  //     return await this.sousActivityRepository.save(sousActivity);
  //   } catch (error) {
  //     throw new InternalServerErrorException('Erreur lors de la mise à jour de la sous-activité');
  //   }
  // }

  async update(
    id: number,
    idActivity: number,
    updateSousActivityDto: UpdateSousActivityDto
  ): Promise<SousActivity> {
    try {
      // Récupérer le budget consommé de la sous-activité
      const budgetConsomme = updateSousActivityDto.budgetConsomme;
  
      // Trouver la sous-activité existante
      const sousActivity = await this.findOne(id);
      if (!sousActivity) {
        throw new NotFoundException('Sous-activité non trouvée');
      }
  
      // Trouver l'activité associée avec toutes ses sous-activités
      const activity = await this.activityRepository.findOne(idActivity);
  
      if (!activity) {
        throw new NotFoundException('Activité non trouvée');
      }
  
      // Mettre à jour le budget consommé de l'activité
      activity.budgetConsomme += budgetConsomme;
  
      // Enregistrer les modifications sur l'activité
      await this.activityRepository.update(idActivity, { budgetConsomme: activity.budgetConsomme });
  
      // Vérifier si tous les statuts des sous-activités sont "clôturés"
      const allSubActivitiesClosed = activity.subactivities.every(
        (subActivity) => subActivity.status.toLowerCase() === 'cloturé'
      );
  
      if (allSubActivitiesClosed) {
        // Si oui, mettre à jour le statut de l'activité
        activity.status = 'clôturé';
        await this.activityRepository.update(idActivity, { status: activity.status });
      }
  
      // Mettre à jour les données de la sous-activité
      Object.assign(sousActivity, updateSousActivityDto);
  
      // Enregistrer les modifications sur la sous-activité
      return await this.sousActivityRepository.save(sousActivity);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sous-activité et du budget de l\'activité:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour de la sous-activité et du budget de l\'activité'
      );
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

