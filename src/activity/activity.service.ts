import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilder, Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { Livrable } from 'src/livrable/entities/livrable.entity';
import { groupBy } from 'lodash'; 
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

          let budgetActivity:number=0;

          const { subactivities, livrable, typelivrable, ...activityData } = createActivityDto;
          subactivities.forEach((subactivity:any)=>{
            budgetActivity+=subactivity.budget
          })

    
          const result = subactivities.reduce((acc, activity) => {
            // Comparer les dates pour trouver la plus ancienne et la plus récente
            acc.minDebut = acc.minDebut ? (new Date(activity.debut) < new Date(acc.minDebut) ? activity.debut : acc.minDebut) : activity.debut;
            acc.maxFin = acc.maxFin ? (new Date(activity.fin) > new Date(acc.maxFin) ? activity.fin : acc.maxFin) : activity.fin;
            return acc;
        }, { minDebut: null, maxFin: null });

        const activity = this.activityRepository.create(activityData);

        if(livrable){
            const createLivrable= this.livrableRepository.create({livrable, typelivrable})
            const savedLivrable= await this.livrableRepository.save(createLivrable)
            activity.livrable=savedLivrable
        }

          // Créer une nouvelle instance d'Activity à partir des données fournies
          activity.budget= createActivityDto.budget ? createActivityDto.budget :  budgetActivity
          activity.dateDebut= createActivityDto.dateDebut ? createActivityDto.dateDebut : result.minDebut
          activity.dateFin=createActivityDto.dateFin ? createActivityDto.dateFin : result.maxFin


          // Sauvegarder l'activité principale dans la base de données
          const savedActivity = await this.activityRepository.save(activity);

          // Gérer les sous-activités si elles sont présentes
          if (subactivities && subactivities.length > 0) {
              const sousActivityPromises = subactivities.map(async (subactivity) => {
                const { livrable, typelivrable, ...subActivityData } = subactivity;

                const sousActivity = this.subActivityRepository.create({
                    ...subActivityData ,
                    activity: savedActivity, // Associer la sous-activité à l'activité principale
                });

                if(livrable){
                    const createLivrableSubLivraison= this.livrableRepository.create({livrable, typelivrable})
                    const savedLivrableSubLivraison= await this.livrableRepository.save(createLivrableSubLivraison)
                    sousActivity.livrable=savedLivrableSubLivraison
                }
         
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

    async findAllGroupedByDirectionAndResponsible(
        etat?: string,
        status?: string,
        responsable?: string,
        direction?: string,
        province?: string,
        titre?: string,
        dateDebut?: string,  // Filtre optionnel par date de début
        dateFin?: string,    // Filtre optionnel par date de fin
        page: string = '1',  // Page actuelle (par défaut 1)
        limit: number = 7    // Nombre d'éléments par page (par défaut 7)
    ): Promise<{
        activites: Record<string, Record<string, Activity[]>>;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }> {
        try {
            const queryBuilder = this.activityRepository.createQueryBuilder('activity')
            .leftJoinAndSelect('activity.subactivities', 'subactivities')
            .leftJoinAndSelect('activity.livrable', 'livrable')
            .leftJoinAndSelect('activity.annotations', 'annotations')
            .leftJoinAndSelect('activity.demandes', 'demandes')
    
            if (etat) {
                queryBuilder.andWhere('activity.etat = :etat', { etat: etat });
            }
    
            if (status) {
                queryBuilder.andWhere('activity.status = :status', { status: status });
            }
    
            if (direction) {
                queryBuilder.andWhere('activity.direction = :direction', { direction: direction });
            }
    
            if (province) {
                queryBuilder.andWhere('activity.province = :province', { province: province });
            }
    
            if (titre) {
                queryBuilder.andWhere('activity.titre LIKE :titre', { titre: `%${titre}%` });
            }
    
            if (responsable) {
                queryBuilder.andWhere('subactivities.responsable = :responsable', { responsable: responsable });
            }
    
                // Ajouter les filtres par date si fournis
                if (dateDebut && dateFin) {
                    // Incrémenter la dateFin d'un jour si elle est fournie
                    const nextDay = new Date(dateFin);
                    nextDay.setDate(nextDay.getDate() + 1);  // Ajoute 1 jour à la dateFin

                    queryBuilder.andWhere('activity.date BETWEEN :dateDebut AND :nextDay', { 
                        dateDebut, 
                        nextDay: nextDay.toISOString() // Convertir la date en format ISO pour la requête
                    });
                } else if (dateDebut) {
                    queryBuilder.andWhere('activity.date >= :dateDebut', { dateDebut });
                } else if (dateFin) {
                    // Incrémenter la dateFin d'un jour si seule la dateFin est fournie
                    const nextDay = new Date(dateFin);
                    nextDay.setDate(nextDay.getDate() + 1);  // Ajoute 1 jour à la dateFin

                    queryBuilder.andWhere('activity.date <= :nextDay', { nextDay: nextDay.toISOString() });
                }
    
            // Calculer les métadonnées de pagination
            const [activities, totalCount] = await queryBuilder
                .take(limit) // Limite d'éléments par page
                .skip((parseInt(page, 10) - 1) * limit) // Sauter les éléments des pages précédentes
                .getManyAndCount();
    
            // Groupement des activités par direction et responsable
            const grouped = activities.reduce((directionAcc, activity) => {
                const { direction, subactivities } = activity;
    
                if (!directionAcc[direction]) {
                    directionAcc[direction] = {}; // Initialiser la direction
                }
    
                subactivities.forEach((sub) => {
                    const { responsable } = sub;
    
                    if (!directionAcc[direction][responsable]) {
                        directionAcc[direction][responsable] = []; // Initialiser le responsable
                    }
    
                    // Vérifier si l'activité est déjà ajoutée
                    const alreadyExists = directionAcc[direction][responsable].some(
                        (existingActivity) => existingActivity.id === activity.id
                    );
    
                    if (!alreadyExists) {
                        directionAcc[direction][responsable].push(activity); // Ajouter l'activité si elle n'est pas déjà présente
                    }
                });
    
                return directionAcc;
            }, {} as Record<string, Record<string, Activity[]>>);
    
            // Calcul des métadonnées de pagination
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = parseInt(page, 10) < totalPages;
            const hasPrevPage = parseInt(page, 10) > 1;
    
            return {
                activites: grouped,
                totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage,
            };
        } catch (error) {
            throw new BadRequestException(
                'Échec de la récupération des activités par direction et responsable',
                error.message
            );
        }
    }
    
    async findAllGroupedByDirection(
        etat?: string,
        status?: string,
        direction?: string,
        province?: string,
        titre?: string,
        dateDebut?: string,
        dateFin?: string,
        page: string = '1',
        limit: number = 7
    ): Promise<{
        activites: Record<string, Activity[]>;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }> {
        try {
            const queryBuilder = this.activityRepository.createQueryBuilder('activity')
                .leftJoinAndSelect('activity.subactivities', 'subactivities')
                .leftJoinAndSelect('subactivities.livrable', 'subactivityLivrable') // Inclure les livrables des sous-activités
                .leftJoinAndSelect('activity.livrable', 'activityLivrable')
                .leftJoinAndSelect('activity.annotations', 'annotations')
                .leftJoinAndSelect('activity.demandes', 'demandes');
    
            // Application des filtres
            if (etat) {
                queryBuilder.andWhere('activity.etat = :etat', { etat });
            }
    
            if (status) {
                queryBuilder.andWhere('activity.status = :status', { status });
            }
    
            if (direction) {
                queryBuilder.andWhere('activity.direction = :direction', { direction });
            }
    
            if (province) {
                queryBuilder.andWhere('activity.province = :province', { province });
            }
    
            if (titre) {
                queryBuilder.andWhere('activity.titre LIKE :titre', { titre: `%${titre}%` });
            }
    
            if (dateDebut && dateFin) {
                const nextDay = new Date(dateFin);
                nextDay.setDate(nextDay.getDate() + 1);
                queryBuilder.andWhere('activity.date BETWEEN :dateDebut AND :nextDay', { dateDebut, nextDay: nextDay.toISOString() });
            } else if (dateDebut) {
                queryBuilder.andWhere('activity.date >= :dateDebut', { dateDebut });
            } else if (dateFin) {
                const nextDay = new Date(dateFin);
                nextDay.setDate(nextDay.getDate() + 1);
                queryBuilder.andWhere('activity.date <= :nextDay', { nextDay: nextDay.toISOString() });
            }
    
            // Pagination
            const [activities, totalCount] = await queryBuilder
                .take(limit)
                .skip((parseInt(page, 10) - 1) * limit)
                .getManyAndCount();
    
            // Groupement des activités par direction
            const grouped = activities.reduce((directionAcc, activity) => {
                const { direction } = activity;
                if (!directionAcc[direction]) {
                    directionAcc[direction] = [];
                }
                directionAcc[direction].push(activity);
                return directionAcc;
            }, {} as Record<string, Activity[]>);
    
            // Métadonnées de pagination
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = parseInt(page, 10) < totalPages;
            const hasPrevPage = parseInt(page, 10) > 1;
    
            return {
                activites: grouped,
                totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage,
            };
        } catch (error) {
            throw new BadRequestException(
                'Échec de la récupération des activités par direction',
                error.message
            );
        }
    }
    
    

async findAllByStatus(status: string): Promise<Activity[]> {
    try {
        // Vérifier si le statut est valide avant d'effectuer la recherche
        const validStatuses = ['En attente', 'Validé', 'Retourné', 'Approuvé', 'Reprogrammé', 'Cloturé']; // Liste des statuts possibles
        if (!validStatuses.includes(status)) {
            throw new BadRequestException(`Statut invalide: ${status}`);
        }

        // Trouver toutes les activités avec le statut passé en paramètre
        return await this.activityRepository.find({
            where: {
                etat: status,
            },
        });
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
            await this.activityRepository.softDelete(id);
        } catch (error) {
            // Gérer les erreurs lors de la suppression
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Échec de la suppression de l\'activité', error.message);
        }
    }



    // Récupérer toutes les activités
    async echeanceActyvity(year:number): Promise<any> {
        try {
        
            console.log('year ', {year})
            const query = this.activityRepository.createQueryBuilder('activity')
            .leftJoinAndSelect('activity.subactivities', 'subactivities')
            .leftJoinAndSelect('activity.livrable', 'livrable')
            .leftJoinAndSelect('activity.annotations', 'annotations')
            .leftJoinAndSelect('activity.demandes', 'demandes')
            .andWhere('YEAR(activity.dateDebut) = :year AND YEAR(activity.dateFin) = :year', {year:year});

            const activities = await query.getMany()

            const result = activities.reduce((acc, activity) => {
                // Comparer les dates pour trouver la plus ancienne et la plus récente
                acc.minDebut = acc.minDebut ? (activity.dateDebut < (acc.minDebut) ? activity.dateDebut : acc.minDebut) : activity.dateDebut;
                acc.maxFin = acc.maxFin ? ((activity.dateFin) > (acc.maxFin) ? activity.dateFin : acc.maxFin) : activity.dateFin;
                return acc;
            }, { minDebut: null, maxFin: null });

            return result

        } catch (error) {
            // Gérer les erreurs lors de la récupération et les envoyer à l'appelant
            throw new BadRequestException('Échec de la récupération des activités', error.message);
        }
    }

    async totalBudget(year:number): Promise<any> {
        try {
        
            console.log('year ', {year})
            const query = this.activityRepository.createQueryBuilder('activity')
            .leftJoinAndSelect('activity.subactivities', 'subactivities')
            .leftJoinAndSelect('activity.livrable', 'livrable')
            .leftJoinAndSelect('activity.annotations', 'annotations')
            .leftJoinAndSelect('activity.demandes', 'demandes')
            .andWhere('YEAR(activity.dateDebut) = :year AND YEAR(activity.dateFin) = :year', {year:year});

            const activities = await query.getMany()

            const result = activities.reduce((acc, activity) => {
                // Comparer les dates pour trouver la plus ancienne et la plus récente
                acc.budgetTotal += activity.budget;
                acc.budgeConsomme += activity.budgetConsomme;
                return acc;
            }, { budgetTotal: 0, budgeConsomme: 0});

            return {...result,
                reste:result.budgetTotal-result.budgeConsomme
            }

        } catch (error) {
            // Gérer les erreurs lors de la récupération et les envoyer à l'appelant
            throw new BadRequestException('Échec de la récupération des activités', error.message);
        }
    }



    async getDirectionProgress(): Promise<any[]> {
        try {
            // Récupérer toutes les activités avec leurs sous-activités et direction
            const activities = await this.activityRepository.find({ relations: ['subactivities'] });
    
            // Calculer la progression pour chaque direction
            const directionProgress = {};
    
            // Parcours de chaque activité pour calculer la progression par direction
            activities.forEach((activity) => {
                const directionName = activity.direction; // Vérifier si direction est définie
                if (!directionName) return; // Ignorer si aucune direction n'est associée
    
                // Calcul de la progression de l'activité
                const totalSubActivities = activity.subactivities?.length || 0;
                const completedSubActivities = activity.subactivities?.filter(subActivity => subActivity.status.toLocaleLowerCase() === "cloturé").length || 0;
    
                const activityProgress = totalSubActivities > 0
                    ? (completedSubActivities / totalSubActivities) * 100
                    : 0;
    
                // Si la direction n'existe pas encore dans le résultat, on l'initialise
                if (!directionProgress[directionName]) {
                    directionProgress[directionName] = {
                        totalProgress: 0,
                        activityCount: 0,
                    };
                }
    
                // Accumuler la progression pour cette direction
                directionProgress[directionName].totalProgress += activityProgress;
                directionProgress[directionName].activityCount += 1;
            });
    
            // Calculer la moyenne de la progression pour chaque direction
            const result = Object.keys(directionProgress).map(directionName => {
                const progressData = directionProgress[directionName];
                return {
                    direction: directionName,
                    progression: progressData.activityCount > 0
                        ? progressData.totalProgress / progressData.activityCount
                        : 0, // Si aucune activité, retourner 0
                };
            });
    
            // Ajouter les directions sans activité (si elles existent dans la base de données)
            const allDirections = await this.activityRepository
                .createQueryBuilder('activity')
                .select('activity.direction')
                .distinct(true)
                .getRawMany();
    
            allDirections.forEach((dir) => {
                const directionName = dir.direction;
                if (directionName && !result.find(r => r.direction === directionName)) {
                    result.push({ direction: directionName, progression: 0 });
                }
            });
    
            return result.filter(r => r.direction); // Filtrer les résultats sans direction
        } catch (error) {
            throw new BadRequestException('Erreur lors du calcul de la progression des directions', error.message);
        }
    }
    

}
