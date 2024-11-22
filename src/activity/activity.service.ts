import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { Livrable } from 'src/livrable/entities/livrable.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,

        @InjectRepository(SousActivity)
        private subActivityRepository: Repository<SousActivity>,

        @InjectRepository(Livrable)
        private readonly livrableRepository: Repository<Livrable>,
    ) {}

    async create(createActivityDto: CreateActivityDto): Promise<Activity> {
      try {
          const { subactivities, livrable, ...activityData } = createActivityDto;

          const createLivrable= this.livrableRepository.create({livrable})
          const savedLivrable= await this.livrableRepository.save(createLivrable)

          // Créer une nouvelle instance d'Activity à partir des données fournies
          const activity = this.activityRepository.create(activityData);
          activity.livrable=savedLivrable
        

          // Sauvegarder l'activité principale dans la base de données
          const savedActivity = await this.activityRepository.save(activity);

          // Gérer les sous-activités si elles sont présentes
          if (subactivities && subactivities.length > 0) {
              const sousActivityPromises = subactivities.map(async (subactivity) => {
                const { livrable, ...subActivityData } = subactivity;

                const createLivrableSubLivraison= this.livrableRepository.create({livrable})
                const savedLivrableSubLivraison= await this.livrableRepository.save(createLivrableSubLivraison)


                  const sousActivity = this.subActivityRepository.create({
                      ...subActivityData ,
                      activity: savedActivity, // Associer la sous-activité à l'activité principale
                  });

                  sousActivity.livrable=savedLivrableSubLivraison
                
                  await this.subActivityRepository.save(sousActivity);
              });

              // Attendre que toutes les sous-activités soient sauvegardées
              await Promise.all(sousActivityPromises);
          }

          // Retourner l'activité complète, y compris les sous-activités
          return await this.activityRepository.findOne({
              where: { id: savedActivity.id },
              relations: ['subactivities'],
          });
      } catch (error) {
          // Gestion des erreurs avec un message explicite
          throw new BadRequestException(
              `Échec de la création de l'activité: ${error.message}`,
          );
      }
  }

    // Récupérer toutes les activités
    async findAll(): Promise<Activity[]> {
        try {
            // Trouver toutes les activités dans la base de données
            return await this.activityRepository.find();
        } catch (error) {
            // Gérer les erreurs lors de la récupération et les envoyer à l'appelant
            throw new BadRequestException('Échec de la récupération des activités', error.message);
        }
    }

    // Récupérer une activité par son ID
    async findOne(id: number): Promise<Activity> {
        try {
            // Chercher une activité par son ID
            const activity = await this.activityRepository.findOne({where:{id}});

            // Si l'activité n'est pas trouvée, lancer une exception NotFound
            if (!activity) {
                throw new NotFoundException(`Activité avec l'ID ${id} non trouvée`);
            }

            // Retourner l'activité trouvée
            return activity;
        } catch (error) {
            // Si l'activité n'est pas trouvée, gérer cette erreur spécifique
            if (error instanceof NotFoundException) {
                throw error;
            }
            // Pour toute autre erreur, lancer une exception générique
            throw new BadRequestException('Échec de la récupération de l\'activité', error.message);
        }
    }

    // Mettre à jour une activité par son ID
    async update(id: number, updateActivityDto: UpdateActivityDto): Promise<Activity> {
        try {
            // Vérifier si l'activité existe avant de la mettre à jour
            const activity = await this.findOne(id);
            if (!activity) {
                throw new NotFoundException(`Activité avec l'ID ${id} non trouvée`);
            }
             
            const { subactivities, livrable, ...activityData } = updateActivityDto;

            // Mettre à jour l'activité dans la base de données
            await this.activityRepository.update(id, activityData);

            // Retourner l'activité mise à jour
            return await this.findOne(id);
        } catch (error) {
            // Gérer les erreurs lors de la mise à jour
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Échec de la mise à jour de l\'activité', error.message);
        }
    }

    // Supprimer une activité par son ID
    async remove(id: number): Promise<void> {
        try {
            // Vérifier si l'activité existe avant de la supprimer
            const activity = await this.findOne(id);
            if (!activity) {
                throw new NotFoundException(`Activité avec l'ID ${id} non trouvée`);
            }

            // Supprimer l'activité de la base de données
            await this.activityRepository.delete(id);
        } catch (error) {
            // Gérer les erreurs lors de la suppression
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Échec de la suppression de l\'activité', error.message);
        }
    }
}
