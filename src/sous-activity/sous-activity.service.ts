// sous-activity.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { SousActivity } from './entities/sous-activity.entity';
import { CreateSousActivityDto } from './dto/create-sous-activity.dto';
import { UpdateSousActivityDto } from './dto/update-sous-activity.dto';
import { ActivityService } from 'src/activity/activity.service';
import { UpdateActivityDto } from 'src/activity/dto/update-activity.dto';
import { CreateActivityDto } from 'src/activity/dto/create-activity.dto';
import { Livrable } from 'src/livrable/entities/livrable.entity';
import { DataSource } from 'typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class SousActivityService {
  constructor(
    @InjectRepository(SousActivity)
    private readonly sousActivityRepository: Repository<SousActivity>,

    private readonly activityRepository:ActivityService,

    @InjectRepository(Livrable)
    private readonly livrableRepository: Repository<Livrable>,

    private dataSource:DataSource

   
  ) {}

  // Create
  async create(createSousActivityDto: CreateSousActivityDto): Promise<SousActivity> {
    try {

      let budgetActivity:number=0;
      
      const { livrable, typelivrable, ...subActivityData } = createSousActivityDto;
      const sousActivity = this.sousActivityRepository.create(subActivityData);

      if(livrable){
        const createLivrableSubLivraison= this.livrableRepository.create({livrable, typelivrable})
        const savedLivrableSubLivraison= await this.livrableRepository.save(createLivrableSubLivraison)
        sousActivity.livrable=savedLivrableSubLivraison
    }

      const subactivitySaved=  await this.sousActivityRepository.save(sousActivity);

      // Trouver l'activité associée avec toutes ses sous-activités
      const activity = await this.activityRepository.findOne(createSousActivityDto.activityId);

      const result = activity.subactivities.reduce((acc, activity) => {
        // Comparer les dates pour trouver la plus ancienne et la plus récente
        acc.minDebut = acc.minDebut ? (new Date(activity.debut) < new Date(acc.minDebut) ? activity.debut : acc.minDebut) : activity.debut;
        acc.maxFin = acc.maxFin ? (new Date(activity.fin) > new Date(acc.maxFin) ? activity.fin : acc.maxFin) : activity.fin;
        return acc;
    }, { minDebut: null, maxFin: null });


        activity.subactivities.forEach((subactivity:any)=>{
          budgetActivity+=subactivity.budget
        })

        activity.budget=budgetActivity;
        activity.dateDebut= result.minDebut
        activity.dateFin=result.maxFin

     // Enregistrer les modifications sur l'activité
      await this.activityRepository.update(createSousActivityDto.activityId, { budget:activity.budget, dateDebut:activity.dateDebut, dateFin:activity.dateFin });


      return subactivitySaved
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création de la sous-activité');
    }
  }



  async createMany(createSousActivityDtos: CreateSousActivityDto[]): Promise<SousActivity[]> {
    const queryRunner = this.sousActivityRepository.manager.connection.createQueryRunner();
    
    // Start a transaction
    await queryRunner.startTransaction();
  
    try {
      const sousActivities: SousActivity[] = [];
  
      for (const dto of createSousActivityDtos) {
        const { livrable, typelivrable, ...subActivityData } = dto;
  
        // Create the SousActivity entity
        const sousActivity = this.sousActivityRepository.create(subActivityData);
  
        if (livrable) {
          // Create the Livrable entity
          const createLivrableSubLivraison = this.livrableRepository.create({ livrable, typelivrable });
  
          // Save the Livrable within the same transaction
          const savedLivrableSubLivraison = await queryRunner.manager.save(createLivrableSubLivraison);
          
          // Assign saved livrable to sousActivity
          sousActivity.livrable = savedLivrableSubLivraison;
        }
  
        sousActivities.push(sousActivity);
      }
  
      // Save all SousActivity entities within the transaction
      await queryRunner.manager.save(SousActivity, sousActivities);
  
      // Commit the transaction
      await queryRunner.commitTransaction();
      
      return sousActivities;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      console.log('inserer eror', error)
      throw new InternalServerErrorException(`Erreur lors de la création des sous-activités ${error}`);

    } finally {
      // Release the query runner to allow other operations
      await queryRunner.release();
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
    updateSousActivityDto: UpdateSousActivityDto,
    idLivrable?:number
  ): Promise<SousActivity> {
    try {
      // Récupérer le budget consommé de la sous-activité
      const budgetConsomme = updateSousActivityDto.budgetConsomme || 0;
  

      let budgetActivity:number=0;

    
 // Trouver la sous-activité existante
 const sousActivity = await this.findOne(id);
 if (!sousActivity) {
   throw new NotFoundException('Sous-activité non trouvée');
 }

      if (updateSousActivityDto.livrable && !idLivrable) {
        // Crée un objet de livrable en fonction de la présence de typelivrable
        const livrableData = updateSousActivityDto.typelivrable ? { livrable:updateSousActivityDto.livrable, typelivrable:updateSousActivityDto.typelivrable  } : { livrable:updateSousActivityDto.livrable };
    
        // Crée et sauvegarde le livrable
        const createLivrable = this.livrableRepository.create(livrableData);
        const savedLivrable = await this.livrableRepository.save(createLivrable);
    
        // Ajoute le livrable sauvegardé à activityData
        sousActivity["livrable"] = savedLivrable;
    }
    if(idLivrable){
      const livrableData = updateSousActivityDto.typelivrable ? { livrable:updateSousActivityDto.livrable, typelivrable:updateSousActivityDto.typelivrable  } : { livrable:updateSousActivityDto.livrable };
        this.livrableRepository.update(idLivrable, livrableData);
    }
  
      // Mettre à jour les données de la sous-activité
      Object.assign(sousActivity, updateSousActivityDto);
  
      // Enregistrer les modifications sur la sous-activité
      const sousActivityResult= await this.sousActivityRepository.save(sousActivity);


       // Trouver l'activité associée avec toutes ses sous-activités
      const activity = await this.activityRepository.findOne(idActivity);

      if (!activity) {
        throw new NotFoundException('Activité non trouvée');
      }

      activity.subactivities.forEach((subactivity:any)=>{
        budgetActivity+=subactivity.budget
      })

      const result = activity.subactivities.reduce((acc, activity) => {
        // Comparer les dates pour trouver la plus ancienne et la plus récente
        acc.minDebut = acc.minDebut ? (new Date(activity.debut) < new Date(acc.minDebut) ? activity.debut : acc.minDebut) : activity.debut;
        acc.maxFin = acc.maxFin ? (new Date(activity.fin) > new Date(acc.maxFin) ? activity.fin : acc.maxFin) : activity.fin;
        return acc;
    }, { minDebut: null, maxFin: null });


      // Vérifier si tous les statuts des sous-activités sont "clôturés"
      const allSubActivitiesClosed = activity.subactivities.every(
        (subActivity) => subActivity.status.toLowerCase() === 'cloturé'
      );

      if (allSubActivitiesClosed) {
        // Si oui, mettre à jour le statut de l'activité
        activity.status = 'cloturé';
        await this.activityRepository.update(idActivity, { status: activity.status });
      }

        // Mettre à jour le budget consommé de l'activité
        activity.budgetConsomme += budgetConsomme;
        activity.budget=budgetActivity;

        activity.dateDebut= result.minDebut
        activity.dateFin=result.maxFin

     // Enregistrer les modifications sur l'activité
      await this.activityRepository.update(idActivity, { budgetConsomme: activity.budgetConsomme, budget:activity.budget, dateDebut:activity.dateDebut, dateFin:activity.dateFin });


      return sousActivityResult
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

