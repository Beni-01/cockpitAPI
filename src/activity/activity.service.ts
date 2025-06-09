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
            .leftJoinAndSelect('subactivities.livrable', 'subactivityLivrable')
            .leftJoinAndSelect('subactivityLivrable.agentValidateur', 'subactivityLivrableAgentValidateur')
            .leftJoinAndSelect('subactivityLivrableAgentValidateur.user', 'subactivityLivrableAgentValidateurUser') // Ajouté
            .leftJoinAndSelect('activity.livrable', 'activityLivrable')
            .leftJoinAndSelect('activityLivrable.agentValidateur', 'activityLivrableAgentValidateur')
            .leftJoinAndSelect('activityLivrableAgentValidateur.user', 'activityLivrableAgentValidateurUser') // Ajouté
            .leftJoinAndSelect('activity.annotations', 'annotations')
            .leftJoinAndSelect('activity.demandes', 'demandes')
            .leftJoinAndSelect('demandes.user', 'demandesUser'); // Ajouté
    
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


                    // Mettre à jour les informations des activités en fonction des sous-activités
        for (const activity of activities) {
            await this.updateActivityFromSubactivities(activity);
        }

    
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
                .leftJoinAndSelect('subactivities.livrable', 'subactivityLivrable')
                .leftJoinAndSelect('activity.livrable', 'activityLivrable')
                .leftJoinAndSelect('subactivityLivrable.agentValidateur', 'subactivityLivrableAgentValidateur')
                .leftJoinAndSelect('subactivityLivrableAgentValidateur.user', 'subactivityLivrableAgentValidateurUser') // Ajouté
                .leftJoinAndSelect('activity.annotations', 'annotations')
                .leftJoinAndSelect('activity.demandes', 'demandes'); 

            // Application des filtres
            if (etat) queryBuilder.andWhere('activity.etat = :etat', { etat });
            if (status) queryBuilder.andWhere('activity.status = :status', { status });
            if (direction) queryBuilder.andWhere('activity.direction = :direction', { direction });
            if (province) queryBuilder.andWhere('activity.province = :province', { province });
            if (titre) queryBuilder.andWhere('activity.titre LIKE :titre', { titre: `%${titre}%` });

            if (dateDebut && dateFin) {
                const nextDay = new Date(dateFin);
                nextDay.setDate(nextDay.getDate() + 1);
                queryBuilder.andWhere('(activity.dateDebut BETWEEN :dateDebut AND :dateFin)', { dateDebut, dateFin: nextDay.toISOString() });
            } else if (dateDebut) {
                queryBuilder.andWhere('(activity.dateDebut >= :dateDebut)', { dateDebut });
            } else if (dateFin) {
                const nextDay = new Date(dateFin);
                nextDay.setDate(nextDay.getDate() + 1);
                queryBuilder.andWhere('activity.dateFin <= :nextDay', { nextDay: nextDay.toISOString() });
            }

            // Pagination
            const [activities, totalCount] = await queryBuilder
                .take(limit)
                .skip((parseInt(page, 10) - 1) * limit)
                .getManyAndCount();

            // Mettre à jour les informations des activités en fonction des sous-activités
            for (const activity of activities) {
                await this.updateActivityFromSubactivities(activity);
            }

            // Groupement des activités par direction
            const grouped = activities.reduce((acc, activity) => {
                acc[activity.direction] = acc[activity.direction] || [];
                acc[activity.direction].push(activity);
                return acc;
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
            throw new BadRequestException(`Échec de la récupération des activités : ${error.message}`);
        }
    }

    private async updateActivityFromSubactivities(activity: Activity){
        if (!activity.subactivities || activity.subactivities.length === 0) return;

        // Calcul des nouvelles dates et du budget total
        const result = activity.subactivities.reduce((acc, subactivity) => {
            acc.minDebut = acc.minDebut
                ? (new Date(subactivity.debut) < new Date(acc.minDebut) ? subactivity.debut : acc.minDebut)
                : subactivity.debut;

            acc.maxFin = acc.maxFin
                ? (new Date(subactivity.fin) > new Date(acc.maxFin) ? subactivity.fin : acc.maxFin)
                : subactivity.fin;

            acc.totalBudget += subactivity.budget || 0;

            return acc;
        }, { minDebut: null, maxFin: null, totalBudget: 0, taux_deadline:null });


        await this.updateDeadlineRateFromSubactivities(activity)

        // Mise à jour de l'activité
        activity.dateDebut = result.minDebut;
        activity.dateFin = result.maxFin;
        activity.budget = result.totalBudget;

        // Enregistrer les modifications
        await this.activityRepository.update(activity.id, {
            dateDebut: activity.dateDebut,
            dateFin: activity.dateFin,
            budget: activity.budget
        });
    }


   async updateDeadlineRateFromSubactivities(activity: Activity) {
        if (!activity.subactivities || activity.subactivities.length === 0) return;
        
        // Mise à jour des deadlineRate
        activity.subactivities.forEach(subactivity => {
            if (subactivity.dateFinReel === null) {
                subactivity.deadlineRate = null;
            } else if (subactivity.dateFinReel <= subactivity.fin) {
                subactivity.deadlineRate = 1;
            } else {
                subactivity.deadlineRate = 0;
            }
        });
    
        // Sauvegarde dans la base de données
        const result = await this.subActivityRepository.save(activity.subactivities);
     

        return result
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
            const activity = await this.activityRepository.findOne({where:{id}, relations:['subactivities']});

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
    async update(id: number, updateActivityDto: UpdateActivityDto, idLivrable?:number): Promise<Activity> {
        try {
            // Vérifier si l'activité existe avant de la mettre à jour
            const activity = await this.findOne(id);
            if (!activity) {
                throw new NotFoundException(`Activité avec l'ID ${id} non trouvée`);
            }
             
            const { subactivities,livrable,typelivrable, ...activityData } = updateActivityDto;


            if (livrable && !idLivrable) {
                // Crée un objet de livrable en fonction de la présence de typelivrable
                const livrableData = typelivrable ? { livrable, typelivrable } : { livrable };
            
                // Crée et sauvegarde le livrable
                const createLivrable = this.livrableRepository.create(livrableData);
                const savedLivrable = await this.livrableRepository.save(createLivrable);
            
                // Ajoute le livrable sauvegardé à activityData
                activityData["livrable"] = savedLivrable;
            }
            if(idLivrable){
                const livrableData = typelivrable ? { livrable, typelivrable } : { livrable };
                this.livrableRepository.update(idLivrable, livrableData);
            }

            // Mettre à jour l'activité dans la base de données
            await this.activityRepository.update(id,activityData);

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




    async getDirectionProgressDeepSeekBis(): Promise<any[]> {
        try {
            const activities = await this.activityRepository.find({ 
                relations: ['subactivities', 'subactivities.livrable'] 
            });
    
            const directionStats = {};
    
            activities.forEach(activity => {
                const direction = activity.direction;
                if (!direction) return;
    
                if (!directionStats[direction]) {
                    directionStats[direction] = {
                        // Métriques de base
                        totalActivity: 0,
                        closedActivity: 0,
                        totalSub: 0,
                        closedSub: 0,
                        passedSub: 0,
                        pendingSub:0,
                        retardSub:0,
                        
                        // KPI2 (deadlineRate)
                        deadlineRateSum: 0,
                        totalDeadlineRates: 0,
                        
                        // KPI3 (livrableQuality)
                        livrableQualitySum: 0,
                        validLivrableCount: 0,
                        
                        // kpi5 (budget)
                        totalBudget: 0,
                        totalBudgetConsomme: 0
                    };
                }
    
                // Compter les activités
                directionStats[direction].totalActivity += 1;

                if (activity.status.toLowerCase() === 'cloturé' || activity.status.toLowerCase() === 'terminé') {
                    directionStats[direction].closedActivity += 1;
                }
    
                const subactivities = activity.subactivities || [];

                directionStats[direction].totalSub += subactivities.length;

                directionStats[direction].closedSub += subactivities.filter(sub => 
                    sub.status?.toLowerCase() === 'cloturé'
                ).length;

                directionStats[direction].pendingSub += subactivities.filter(sub => 
                    sub.status?.toLowerCase() === 'en cours'
                ).length;

                directionStats[direction].passedSub += subactivities.filter(sub => 
                    sub.status?.toLowerCase() === 'dépassé'
                ).length;

                directionStats[direction].retardSub += subactivities.filter(sub => 
                    sub.status?.toLowerCase() === 'en retard'
                ).length;
    
                // Calcul des KPIs
                subactivities.forEach(sub => {
                    // KPI2 - Taux d'échéance
                    directionStats[direction].deadlineRateSum += sub.deadlineRate ?? 0;
                    directionStats[direction].totalDeadlineRates += 1;
    
                    // KPI3 - Qualité livrable
                    if (sub.livrable?.livrableQuality !== null) {
                        directionStats[direction].livrableQualitySum += sub.livrable?.livrableQuality ?? 0;
                        directionStats[direction].validLivrableCount += 1;
                    }
    
                    // kpi5 - Budget
                    directionStats[direction].totalBudget += sub.budget ?? 0;
                    directionStats[direction].totalBudgetConsomme += sub.budgetConsomme ?? 0;
                });
            });
    
            // Construction du résultat final
            const result = Object.keys(directionStats).map(direction => {
                const stats = directionStats[direction];

                const rateBudget=stats.totalBudget > 0
                ? Number((100 - ((stats.totalBudgetConsomme / stats.totalBudget) * 100)).toFixed(2))
                : 0
                
                return {
                    direction,
                    // Métriques de base
                    totalActivity: stats.totalActivity,
                    closedActivity: stats.closedActivity,
                    totalSub: stats.totalSub,
                    closedSub: stats.closedSub,
                    passedSub:stats.passedSub,
                    progression: stats.totalSub > 0 
                        ? Number(((stats.closedSub / stats.totalSub) * 100).toFixed(2))
                        : 0,
                    
                    // KPI2 - Taux d'échéance
                    kpi2: stats.deadlineRateSum,
                    kpi2_percent: stats.totalSub > 0
                        ? Number(((stats.deadlineRateSum / (stats.closedSub+stats.passedSub+stats.pendingSub+stats.retardSub)) * 100).toFixed(2))
                        : 0,
                    
                    // KPI3 - Qualité livrable
                    kpi3: stats.livrableQualitySum,
                    kpi3_percent: stats.validLivrableCount > 0
                        ? Number(((stats.livrableQualitySum / stats.validLivrableCount) * 100).toFixed(2))
                        : 0,
                    
                    // kpi5 - Budget
                    kpi5_percent: rateBudget==100 ? 0 : rateBudget
                };
            });
    
            // Ajout des directions manquantes
            const allDirections = await this.activityRepository
                .createQueryBuilder('activity')
                .select('DISTINCT activity.direction', 'direction')
                .getRawMany();
    
            allDirections.forEach(({ direction }) => {
                if (direction && !result.find(r => r.direction === direction)) {
                    result.push({
                        direction,
                        totalActivity: 0,
                        closedActivity: 0,
                        totalSub: 0,
                        closedSub: 0,
                        passedSub:0,
                        progression: 0,
                        kpi2: 0,
                        kpi2_percent: 0,
                        kpi3: 0,
                        kpi3_percent: 0,
                        kpi5_percent: 0
                    });
                }
            });
    
            return result.filter(r => r.direction);
        } catch (error) {
            throw new BadRequestException('Erreur lors du calcul des indicateurs', error.message);
        }
    }


async getDirectionProgressDeepSeek(
    dateDebut?: string,
    dateFin?: string,
    periode?: string, // 'janvier', 'février', etc. OU 'T1', 'T2', 'T3', 'T4' OU 'S1', 'S2'
    annee?: number
): Promise<any[]> {
    try {
        // Création du queryBuilder avec les relations nécessaires
        const queryBuilder = this.activityRepository
            .createQueryBuilder('activity')
            .leftJoinAndSelect('activity.subactivities', 'subactivities')
            .leftJoinAndSelect('subactivities.livrable', 'livrable');

        // Déterminer l'année à utiliser (courante par défaut)
        const currentYear = annee || new Date().getFullYear();

        // Application des filtres de date
        if (dateDebut && dateFin) {
            // Priorité aux dates exactes si elles sont fournies
            const nextDay = new Date(dateFin);
            nextDay.setDate(nextDay.getDate() + 1);
            queryBuilder.andWhere('(activity.dateDebut BETWEEN :dateDebut AND :dateFin)', {
                dateDebut,
                dateFin: nextDay.toISOString()
            });
        } else if (dateDebut) {
            queryBuilder.andWhere('(activity.dateDebut >= :dateDebut)', { dateDebut });
        } else if (dateFin) {
            const nextDay = new Date(dateFin);
            nextDay.setDate(nextDay.getDate() + 1);
            queryBuilder.andWhere('activity.dateFin <= :nextDay', {
                nextDay: nextDay.toISOString()
            });
        } else if (periode) {
            // Filtrage par période (mois, trimestre ou semestre)
            const periodeLower = periode.toLowerCase();
            let dateStart: Date, dateEnd: Date;

            // Mapping des mois
            const moisMap: { [key: string]: number } = {
                'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
                'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
                'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
            };

            if (moisMap.hasOwnProperty(periodeLower)) {
                // Filtrage par mois
                const moisIndex = moisMap[periodeLower];
                dateStart = new Date(currentYear, moisIndex, 1);
                dateEnd = new Date(currentYear, moisIndex + 1, 0);
            } else {
                // Filtrage par trimestre ou semestre
                switch (periode.toUpperCase()) {
                    // Trimestres
                    case 'T1':
                        dateStart = new Date(currentYear, 0, 1);
                        dateEnd = new Date(currentYear, 2, 31);
                        break;
                    case 'T2':
                        dateStart = new Date(currentYear, 3, 1);
                        dateEnd = new Date(currentYear, 5, 30);
                        break;
                    case 'T3':
                        dateStart = new Date(currentYear, 6, 1);
                        dateEnd = new Date(currentYear, 8, 30);
                        break;
                    case 'T4':
                        dateStart = new Date(currentYear, 9, 1);
                        dateEnd = new Date(currentYear, 11, 31);
                        break;
                    // Semestres
                    case 'S1':
                        dateStart = new Date(currentYear, 0, 1);
                        dateEnd = new Date(currentYear, 5, 30);
                        break;
                    case 'S2':
                        dateStart = new Date(currentYear, 6, 1);
                        dateEnd = new Date(currentYear, 11, 31);
                        break;
                    default:
                        throw new BadRequestException('Période non valide. Utilisez un mois (janvier, février...), un trimestre (T1-T4) ou un semestre (S1-S2)');
                }
            }

            // Ajout du filtre
            queryBuilder.andWhere('(activity.dateDebut BETWEEN :dateStart AND :dateEnd)', {
                dateStart: dateStart.toISOString(),
                dateEnd: dateEnd.toISOString()
            });
        }

        // Exécution de la requête
        const activities = await queryBuilder.getMany();

        // Effectifs par direction (données statiques)
        const directionEffectives = {
            "AIDE D'ACCÈS À LA JUSTICE ET RECOUVREMENT": 20,
            "ADMINISTRATION ET MOYENS GENERAUX": 66,
            "AUDIT INTERNE": 8,
            "BUREAU DU PCA": 3,
            "CELLULE DE PASSATION DES MARCHES": 4,
            "CELLULE DE SECURITE": 2,
            "COMMUNICATION": 17,
            "DIRECTION GENERALE": 9,
            "ETUDES": 60,
            "FINANCE": 37,
            "MEDIATION": 1,
            "REPARATIONS": 54,
            "RH ET JURIDIQUE": 12
        };

        const directionStats = {};

        activities.forEach(activity => {
            const direction = activity.direction;
            if (!direction) return;

            if (!directionStats[direction]) {
                directionStats[direction] = {
                    // Métriques de base
                    totalActivity: 0,
                    closedActivity: 0,
                    totalSub: 0,
                    closedSub: 0,
                    passedSub: 0,
                    pendingSub: 0,
                    retardSub: 0,
                    totalRessources: 0, // Nouveau: Somme des ressources des sous-activités clôturées
                    
                    // KPI2 (deadlineRate)
                    deadlineRateSum: 0,
                    totalDeadlineRates: 0,
                    
                    // KPI3 (livrableQuality)
                    livrableQualitySum: 0,
                    validLivrableCount: 0,
                    
                    // KPI5 (budget)
                    totalBudget: 0,
                    totalBudgetConsomme: 0,

                    // KPI4: Effectif de la direction
                    directionEffective: directionEffectives[direction] || 1 // Fallback à 1 pour éviter division par 0
                };
            }

            // Compter les activités
            directionStats[direction].totalActivity += 1;
            if (activity.status.toLowerCase() === 'cloturé' || activity.status.toLowerCase() === 'terminé') {
                directionStats[direction].closedActivity += 1;
            }

            // Traitement des sous-activités
            const subactivities = activity.subactivities || [];
            directionStats[direction].totalSub += subactivities.length;

            directionStats[direction].closedSub += subactivities.filter(sub => 
                sub.status?.toLowerCase() === 'cloturé'
            ).length;

            directionStats[direction].pendingSub += subactivities.filter(sub => 
                sub.status?.toLowerCase() === 'en cours'
            ).length;

            directionStats[direction].passedSub += subactivities.filter(sub => 
                sub.status?.toLowerCase() === 'dépassé'
            ).length;

            directionStats[direction].retardSub += subactivities.filter(sub => 
                sub.status?.toLowerCase() === 'en retard'
            ).length;

            // Calcul des KPIs
            subactivities.forEach(sub => {
                // KPI2 - Taux d'échéance
                directionStats[direction].deadlineRateSum += sub.deadlineRate ?? 0;
                directionStats[direction].totalDeadlineRates += 1;

                // KPI3 - Qualité livrable
                if (sub.livrable?.livrableQuality !== null) {
                    directionStats[direction].livrableQualitySum += sub.livrable?.livrableQuality ?? 0;
                    directionStats[direction].validLivrableCount += 1;
                }

                // KPI4 - Ressources utilisées (uniquement pour les sous-activités clôturées)
                if (sub.status?.toLowerCase() === 'cloturé') {
                    directionStats[direction].totalRessources += sub.nbre_ressource ?? 0;
                }
                // KPI5 - Budget
                directionStats[direction].totalBudget += sub.budget ?? 0;
                directionStats[direction].totalBudgetConsomme += sub.budgetConsomme ?? 0;
            });
        });

        // Construction du résultat final
        const result = Object.keys(directionStats).map(direction => {
            const stats = directionStats[direction];

            const bonus=Number((((stats.totalBudget-stats.totalBudgetConsomme)/stats.totalBudget)*100).toFixed(2))

            // Calcul KPI5 (taux de budget restant)
            const rateBudget = stats.totalBudget > 0 && stats.totalBudget<=stats.totalBudgetConsomme
                ? Number((((stats.totalBudget / stats.totalBudgetConsomme) * 100)).toFixed(2))
                : 100+bonus;

            return {
                direction,
                // Métriques de base
                totalActivity: stats.totalActivity,
                closedActivity: stats.closedActivity,
                totalSub: stats.totalSub,
                closedSub: stats.closedSub,
                passedSub: stats.passedSub,
                progression: stats.totalSub > 0 
                    ? Number(((stats.closedSub / stats.totalSub) * 100).toFixed(2))
                    : 0,
                
                // KPI2 - Taux d'échéance
                kpi2: stats.deadlineRateSum,
                kpi2_percent: stats.totalSub > 0
                    ? Number(((stats.deadlineRateSum / (stats.closedSub + stats.passedSub + stats.pendingSub + stats.retardSub)) * 100).toFixed(2))
                    : 0,
                
                // KPI3 - Qualité livrable
                kpi3: stats.livrableQualitySum,
                kpi3_percent: stats.validLivrableCount > 0
                    ? Number(((stats.livrableQualitySum / stats.validLivrableCount) * 100).toFixed(2))
                    : 0,
                
                // KPI4 - Efficacité des ressources
                kpi4_percent: stats.totalSub > 0 && stats.directionEffective > 0
                    ? Number((
                        (((stats.closedSub * stats.directionEffective) / 
                        (stats.totalSub * stats.totalRessources)) * 100)
                      ).toFixed(2))
                    : 0,
                totalRessources:stats.totalRessources,
                // KPI5 - Budget
                totalBudget:stats.totalBudget, 
                totalBudgetConsomme:stats.totalBudgetConsomme,
                kpi5_percent:  stats.totalBudgetConsomme==0 ? 0 : Number(rateBudget.toFixed(2))
            };
        });

        // Ajout des directions manquantes (avec toutes les métriques à 0)
        const allDirections = await this.activityRepository
            .createQueryBuilder('activity')
            .select('DISTINCT activity.direction', 'direction')
            .getRawMany();

        allDirections.forEach(({ direction }) => {
            if (direction && !result.find(r => r.direction === direction)) {
                result.push({
                    direction,
                    totalActivity: 0,
                    closedActivity: 0,
                    totalSub: 0,
                    closedSub: 0,
                    passedSub: 0,
                    progression: 0,
                    kpi2: 0,
                    kpi2_percent: 0,
                    kpi3: 0,
                    kpi3_percent: 0,
                    kpi4_percent: 0,
                    totalBudget:0,
                    totalRessources:0,
                    totalBudgetConsomme:0,
                    kpi5_percent: 0
                });
            }
        });

        return result.filter(r => r.direction);
    } catch (error) {
        throw new BadRequestException('Erreur lors du calcul des indicateurs', error.message);
    }
}




    async getDirectionStats(): Promise<any[]> {
        try {
            const activities = await this.activityRepository.find({ relations: ['subactivities'] });
            const directionStats: { [key: string]: { [status: string]: number } } = {};
    
            // Parcourir les activités et compter les statuts des sous-activités
            activities.forEach((activity) => {
                const directionName = activity.direction;
                if (!directionName) return;
    
                // Initialiser la direction si elle n'existe pas
                if (!directionStats[directionName]) {
                    directionStats[directionName] = {};
                }
    
                // Compter les statuts des sous-activités
                activity.subactivities?.forEach((subActivity) => {
                    const status = subActivity.status.toLowerCase(); // Normaliser le statut
                    if (status) {
                        directionStats[directionName][status] = (directionStats[directionName][status] || 0) + 1;
                    }
                });
            });
    
            // Convertir en format de résultat demandé
            let result = Object.entries(directionStats).map(([direction, stats]) => ({
                direction,
                Stats: Object.entries(stats).map(([status, nombre]) => ({ status, nombre }))
            }));
    
            // Ajouter les directions sans sous-activités
            const allDirections = await this.activityRepository
                .createQueryBuilder('activity')
                .select('activity.direction')
                .distinct(true)
                .getRawMany();
    
            allDirections.forEach((dir) => {
                const directionName = dir.direction;
                if (directionName && !result.some(r => r.direction === directionName)) {
                    result.push({ direction: directionName, Stats: [] });
                }
            });
    
            return result.filter(r => r.direction);
        } catch (error) {
            throw new BadRequestException('Erreur lors du calcul des statistiques', error.message);
        }
    }
    

    async updateAllActivities() {
        const activities = await this.activityRepository.find({ relations: ['subactivities'] });
    
        for (const activity of activities) {
            await this.updateActivityFromSubactivities(activity);
        }

        return {message:"L'actualisation s'est effectuée avec succèss", code:200};
    }

    async updateActivityFromSubactivitiesById(activityId: number)  {
        try {
            // Récupérer l'activité avec ses sous-activités
            const activity = await this.activityRepository.findOne({
                where: { id: activityId },
                relations: ['subactivities'],
            });
    
            if (!activity) {
                throw new NotFoundException(`Activité avec l'ID ${activityId} non trouvée.`);
            }
    
            if (activity.subactivities.length === 0) {
                throw new BadRequestException(`L'activité ${activityId} n'a pas de sous-activités.`);
            }
    
            // Calculer les nouvelles dates et le budget total
            const result = activity.subactivities.reduce(
                (acc, subactivity) => {
                    acc.minDebut = acc.minDebut
                        ? new Date(subactivity.debut) < new Date(acc.minDebut)
                            ? subactivity.debut
                            : acc.minDebut
                        : subactivity.debut;
    
                    acc.maxFin = acc.maxFin
                        ? new Date(subactivity.fin) > new Date(acc.maxFin)
                            ? subactivity.fin
                            : acc.maxFin
                        : subactivity.fin;
    
                    acc.totalBudget += subactivity.budget || 0;
                    return acc;
                },
                { minDebut: null, maxFin: null, totalBudget: 0 }
            );
    
            // Mise à jour de l'activité
            await this.activityRepository.update(activityId, {
                dateDebut: result.minDebut,
                dateFin: result.maxFin,
                budget: result.totalBudget,
            });

            return {message:"L'actualisation s'est effectuée avec succèss", code:200};
    
        } catch (error) {
            throw new BadRequestException(
                `Erreur lors de la mise à jour de l'activité ${activityId} : ${error.message}`
            );
        }
    }
    
    
}
