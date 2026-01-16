import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, QueryBuilder, Repository } from 'typeorm';
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






async getDirectionGlobalProgress(
  dateDebut?: string,
  dateFin?: string,
  periode?: string,
  annee?: number
): Promise<any[]> {
  try {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.subactivities', 'subactivities')
      .leftJoinAndSelect('subactivities.livrable', 'livrable');

    const currentYear = annee || new Date().getFullYear();

    if (dateDebut && dateFin) {
      const nextDay = new Date(dateFin);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder.andWhere(
        '(activity.dateDebut BETWEEN :dateDebut AND :dateFin)',
        { dateDebut, dateFin: nextDay.toISOString() }
      );
    } else if (dateDebut) {
      queryBuilder.andWhere('(activity.dateDebut >= :dateDebut)', { dateDebut });
    } else if (dateFin) {
      const nextDay = new Date(dateFin);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder.andWhere('activity.dateFin <= :nextDay', {
        nextDay: nextDay.toISOString()
      });
    } else if (periode) {
      const periodeLower = periode.toLowerCase();
      let dateStart: Date, dateEnd: Date;

      const moisMap: Record<string, number> = {
        janvier: 0, février: 1, mars: 2, avril: 3,
        mai: 4, juin: 5, juillet: 6, août: 7,
        septembre: 8, octobre: 9, novembre: 10, décembre: 11
      };

      if (moisMap[periodeLower] !== undefined) {
        const m = moisMap[periodeLower];
        dateStart = new Date(currentYear, m, 1);
        dateEnd = new Date(currentYear, m + 1, 0);
      } else {
        switch (periode.toUpperCase()) {
          case 'T1': dateStart = new Date(currentYear, 0, 1); dateEnd = new Date(currentYear, 2, 31); break;
          case 'T2': dateStart = new Date(currentYear, 3, 1); dateEnd = new Date(currentYear, 5, 30); break;
          case 'T3': dateStart = new Date(currentYear, 6, 1); dateEnd = new Date(currentYear, 8, 30); break;
          case 'T4': dateStart = new Date(currentYear, 9, 1); dateEnd = new Date(currentYear, 11, 31); break;
          case 'S1': dateStart = new Date(currentYear, 0, 1); dateEnd = new Date(currentYear, 5, 30); break;
          case 'S2': dateStart = new Date(currentYear, 6, 1); dateEnd = new Date(currentYear, 11, 31); break;
          default:
            throw new BadRequestException('Période non valide');
        }
      }

      queryBuilder.andWhere(
        '(activity.dateDebut BETWEEN :dateStart AND :dateEnd)',
        { dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString() }
      );
    }

    const activities = await queryBuilder.getMany();

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

    const directionStats: any = {};

    activities.forEach(activity => {
      const direction = activity.direction;
      if (!direction) return;

      if (!directionStats[direction]) {
        directionStats[direction] = {
          totalActivity: 0,
          closedActivity: 0,
          totalSub: 0,
          closedSub: 0,
          passedSub: 0,
          pendingSub: 0,
          retardSub: 0,

          // KPI 2 (corrigé)
          closedSubOnTime: 0,

          livrableQualitySum: 0,
          validLivrableCount: 0,

          totalRessources: 0,
          totalBudget: 0,
          totalBudgetConsomme: 0,

          directionEffective: directionEffectives[direction] || 1
        };
      }

      const stats = directionStats[direction];
      stats.totalActivity++;

      if (['cloturé', 'terminé'].includes(activity.status?.toLowerCase())) {
        stats.closedActivity++;
      }

      const subs = activity.subactivities || [];
      stats.totalSub += subs.length;

      subs.forEach(sub => {
        const status = sub.status?.toLowerCase();

        if (status === 'cloturé') {
          stats.closedSub++;

          if (sub.deadlineRate === 1) {
            stats.closedSubOnTime++;
          }

          stats.totalRessources += sub.nbre_ressource ?? 0;
        }

        if (status === 'en retard') stats.retardSub++;
        if (status === 'en cours') stats.pendingSub++;
        if (status === 'dépassé') stats.passedSub++;

        if (sub.livrable?.livrableQuality != null) {
          stats.livrableQualitySum += sub.livrable.livrableQuality;
          stats.validLivrableCount++;
        }

        stats.totalBudget += sub.budget ?? 0;
        stats.totalBudgetConsomme += sub.budgetConsomme ?? 0;
      });
    });

    return Object.keys(directionStats).map(direction => {
      const s = directionStats[direction];

      const bonus =
        s.totalBudget > 0
          ? ((s.totalBudget - s.totalBudgetConsomme) / s.totalBudget) * 100
          : 0;

      const kpi5 =
        s.totalBudgetConsomme === 0
          ? 0
          : s.totalBudget <= s.totalBudgetConsomme
            ? (s.totalBudget / s.totalBudgetConsomme) * 100
            : 100 + bonus;

      return {
        direction,
        totalActivity: s.totalActivity,
        closedActivity: s.closedActivity,
        totalSub: s.totalSub,
        closedSub: s.closedSub,
        passedSub: s.passedSub,
        retardSub: s.retardSub,

        progression:
          s.totalSub > 0
            ? Number((((s.closedSub + s.retardSub) / s.totalSub) * 100).toFixed(2))
            : 0,

        // KPI 2 – CORRECT
        kpi2_percent:
          s.closedSub > 0
            ? Number(((s.closedSubOnTime / s.closedSub) * 100).toFixed(2))
            : 0,

        kpi3_percent:
          s.validLivrableCount > 0
            ? Number(((s.livrableQualitySum / s.validLivrableCount) * 100).toFixed(2))
            : 0,

        kpi4_percent:
          s.totalSub > 0 && s.totalRessources > 0
            ? Number(
                ((((s.closedSub / s.totalSub) /
                  (s.totalRessources / s.directionEffective)) *
                  (s.livrableQualitySum / 100)) *
                  100).toFixed(2)
              )
            : 0,

        totalRessources: s.totalRessources,
        totalBudget: s.totalBudget,
        totalBudgetConsomme: s.totalBudgetConsomme,
        kpi5_percent: Number(kpi5.toFixed(2))
      };
    });
  } catch (error) {
    throw new BadRequestException(
      'Erreur lors du calcul des indicateurs',
      error.message
    );
  }
}

async getDirectionGlobalProgressPlafone2(
  dateDebut?: string,
  dateFin?: string,
  periode?: string,
  annee?: number
): Promise<any[]> {
  try {
    const currentYear = annee || new Date().getFullYear();

    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.subactivities', 'subactivities')
      .leftJoinAndSelect('subactivities.livrable', 'livrable')
      .where('YEAR(activity.createdAt) = :year', { year: currentYear });

    if (dateDebut && dateFin) {
      const nextDay = new Date(dateFin);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder.andWhere(
        '(activity.dateDebut BETWEEN :dateDebut AND :dateFin)',
        { dateDebut, dateFin: nextDay.toISOString() }
      );
    } else if (dateDebut) {
      queryBuilder.andWhere('(activity.dateDebut >= :dateDebut)', { dateDebut });
    } else if (dateFin) {
      const nextDay = new Date(dateFin);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder.andWhere('activity.dateFin <= :nextDay', {
        nextDay: nextDay.toISOString()
      });
    } else if (periode) {
      const periodeLower = periode.toLowerCase();
      let dateStart: Date, dateEnd: Date;

      const moisMap: Record<string, number> = {
        janvier: 0, février: 1, mars: 2, avril: 3,
        mai: 4, juin: 5, juillet: 6, août: 7,
        septembre: 8, octobre: 9, novembre: 10, décembre: 11
      };

      if (moisMap[periodeLower] !== undefined) {
        const m = moisMap[periodeLower];
        dateStart = new Date(currentYear, m, 1);
        dateEnd = new Date(currentYear, m + 1, 0);
      } else {
        switch (periode.toUpperCase()) {
          case 'T1': dateStart = new Date(currentYear, 0, 1); dateEnd = new Date(currentYear, 2, 31); break;
          case 'T2': dateStart = new Date(currentYear, 3, 1); dateEnd = new Date(currentYear, 5, 30); break;
          case 'T3': dateStart = new Date(currentYear, 6, 1); dateEnd = new Date(currentYear, 8, 30); break;
          case 'T4': dateStart = new Date(currentYear, 9, 1); dateEnd = new Date(currentYear, 11, 31); break;
          case 'S1': dateStart = new Date(currentYear, 0, 1); dateEnd = new Date(currentYear, 5, 30); break;
          case 'S2': dateStart = new Date(currentYear, 6, 1); dateEnd = new Date(currentYear, 11, 31); break;
          default:
            throw new BadRequestException('Période non valide');
        }
      }

      queryBuilder.andWhere(
        '(activity.dateDebut BETWEEN :dateStart AND :dateEnd)',
        { dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString() }
      );
    }

    const activities = await queryBuilder.getMany();

    const directionEffectives: Record<string, number> = {
      "AIDE D'ACCÈS À LA JUSTICE ET RECOUVREMENT": 20,
      "ADMINISTRATION ET MOYENS GENERAUX": 66,
      "AUDIT INTERNE": 8,
      "BUREAU DU PCA": 3,
      "CELLULE DE PASSATION DES MARCHES": 4,
      "CELLULE DE SECURITE": 2,
      "COMMUNICATION": 17,
      "DIRECTION GENERALE": 9,
      "ETUDES": 60,
      "MEDIATION": 1,
      "REPARATIONS": 54,
      "RH ET JURIDIQUE": 12,
      "ETUDES, ENQUETES ET EVALUATIONS": 15 // exemple si tu veux inclure celle qui n'a rien
    };

    // 🔹 Pré-remplissage de toutes les directions
    const directionStats: Record<string, any> = {};
    Object.keys(directionEffectives).forEach(direction => {
      directionStats[direction] = {
        totalActivity: 0,
        closedActivity: 0,
        totalSub: 0,
        closedSub: 0,
        passedSub: 0,
        pendingSub: 0,
        retardSub: 0,
        closedSubOnTime: 0,
        livrableQualitySum: 0,
        validLivrableCount: 0,
        totalRessources: 0,
        totalBudget: 0,
        totalBudgetConsomme: 0,
        directionEffective: directionEffectives[direction] || 1
      };
    });

    // 🔹 Parcours des activités pour compléter les stats
    activities.forEach(activity => {
      const direction = activity.direction;
      if (!direction || !directionStats[direction]) return;

      const stats = directionStats[direction];
      stats.totalActivity++;

      if (['cloturé', 'terminé'].includes(activity.status?.toLowerCase())) {
        stats.closedActivity++;
      }

      const subs = activity.subactivities || [];
      stats.totalSub += subs.length;

      subs.forEach(sub => {
        const status = sub.status?.toLowerCase();

        if (status === 'cloturé') {
          stats.closedSub++;
          if (sub.deadlineRate === 1) stats.closedSubOnTime++;
          stats.totalRessources += sub.nbre_ressource ?? 0;
        }

        if (status === 'en retard') stats.retardSub++;
        if (status === 'en cours') stats.pendingSub++;
        if (status === 'dépassé') stats.passedSub++;

        if (sub.livrable?.livrableQuality != null) {
          stats.livrableQualitySum += sub.livrable.livrableQuality;
          stats.validLivrableCount++;
        }

        stats.totalBudget += sub.budget ?? 0;
        stats.totalBudgetConsomme += sub.budgetConsomme ?? 0;
      });
    });

    return Object.keys(directionStats).map(direction => {
      const s = directionStats[direction];

      const bonus =
        s.totalBudget > 0
          ? ((s.totalBudget - s.totalBudgetConsomme) / s.totalBudget) * 100
          : 0;

      let rateBudget =
        s.totalBudgetConsomme === 0
          ? 0
          : s.totalBudget <= s.totalBudgetConsomme
              ? (s.totalBudget / s.totalBudgetConsomme) * 100
              : 100 + bonus;

      rateBudget = Math.min(rateBudget, 110);

      return {
        direction,
        totalActivity: s.totalActivity,
        closedActivity: s.closedActivity,
        totalSub: s.totalSub,
        closedSub: s.closedSub,
        passedSub: s.passedSub,
        retardSub: s.retardSub,
        progression: s.totalSub > 0 ? Number((((s.closedSub + s.retardSub) / s.totalSub) * 100).toFixed(2)) : 0,
        kpi2_percent: s.closedSub > 0 ? Number(((s.closedSubOnTime / s.closedSub) * 100).toFixed(2)) : 0,
        kpi3_percent: s.validLivrableCount > 0 ? Number(((s.livrableQualitySum / s.validLivrableCount) * 100).toFixed(2)) : 0,
        kpi4_percent: s.totalSub > 0 && s.totalRessources > 0
          ? Number(((((s.closedSub / s.totalSub) / (s.totalRessources / s.directionEffective)) * (s.livrableQualitySum / 100)) * 100).toFixed(2))
          : 0,
        totalBudget: s.totalBudget,
        totalBudgetConsomme: s.totalBudgetConsomme,
        totalBudgetPrevu: s.totalBudget,
        totalBudgetConsommeVerifie: s.totalBudgetConsomme,
        kpi5_percent: Number(rateBudget.toFixed(2))
      };
    });
  } catch (error) {
    throw new BadRequestException(
      'Erreur lors du calcul des indicateurs',
      error.message
    );
  }
}

async getDirectionGlobalProgressPlafone(
  dateDebut?: string,
  dateFin?: string,
  periode?: string,
  annee?: number
): Promise<any[]> {
  try {
    const currentYear = annee || new Date().getFullYear();

    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.subactivities', 'subactivities')
      .leftJoinAndSelect('subactivities.livrable', 'livrable')
      .where('YEAR(activity.createdAt) = :year', { year: currentYear });

    if (dateDebut && dateFin) {
      const nextDay = new Date(dateFin);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder.andWhere(
        '(activity.dateDebut BETWEEN :dateDebut AND :dateFin)',
        { dateDebut, dateFin: nextDay.toISOString() }
      );
    } else if (dateDebut) {
      queryBuilder.andWhere('(activity.dateDebut >= :dateDebut)', { dateDebut });
    } else if (dateFin) {
      const nextDay = new Date(dateFin);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder.andWhere('activity.dateFin <= :nextDay', {
        nextDay: nextDay.toISOString()
      });
    } else if (periode) {
      const periodeLower = periode.toLowerCase();
      let dateStart: Date, dateEnd: Date;

      const moisMap: Record<string, number> = {
        janvier: 0, février: 1, mars: 2, avril: 3,
        mai: 4, juin: 5, juillet: 6, août: 7,
        septembre: 8, octobre: 9, novembre: 10, décembre: 11
      };

      if (moisMap[periodeLower] !== undefined) {
        const m = moisMap[periodeLower];
        dateStart = new Date(currentYear, m, 1);
        dateEnd = new Date(currentYear, m + 1, 0);
      } else {
        switch (periode.toUpperCase()) {
          case 'T1': dateStart = new Date(currentYear, 0, 1); dateEnd = new Date(currentYear, 2, 31); break;
          case 'T2': dateStart = new Date(currentYear, 3, 1); dateEnd = new Date(currentYear, 5, 30); break;
          case 'T3': dateStart = new Date(currentYear, 6, 1); dateEnd = new Date(currentYear, 8, 30); break;
          case 'T4': dateStart = new Date(currentYear, 9, 1); dateEnd = new Date(currentYear, 11, 31); break;
          case 'S1': dateStart = new Date(currentYear, 0, 1); dateEnd = new Date(currentYear, 5, 30); break;
          case 'S2': dateStart = new Date(currentYear, 6, 1); dateEnd = new Date(currentYear, 11, 31); break;
          default:
            throw new BadRequestException('Période non valide');
        }
      }

      queryBuilder.andWhere(
        '(activity.dateDebut BETWEEN :dateStart AND :dateEnd)',
        { dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString() }
      );
    }

    const activities = await queryBuilder.getMany();

    const directionEffectives: Record<string, number> = {
  "FINANCE": 15,
  "AUDIT INTERNE": 8,
  "ETUDES, ENQUETES ET EVALUATIONS": 60,
  "REPARATIONS": 54,
  "AIDE D'ACCÈS À LA JUSTICE ET RECOUVREMENT": 20,
  "ADMINISTRATION ET SERVICES GENERAUX": 66,
  "COMMUNICATION": 17,
  "CELLULE DE PASSATION DES MARCHES": 4,
  "RH ET JURIDIQUE": 12,
  "CELLULE DE MEDIATION": 1,
  "CONSEIL D'ADMINISTRATION": 1,
  "DIRECTION GENERALE": 9,
  "SECRETARIAT DIRECTION GENERALE": 1,
  "ASSISTANT DGA": 1,
  "CELLULE DE SECURITE": 2,
  "CELLULE SUIVI ET EVALUATION DE PERFORMANCE": 1,
  "COORDINATION PROVINCIALE": 1
};


    // 🔹 Pré-remplissage de toutes les directions
    const directionStats: Record<string, any> = {};
    Object.keys(directionEffectives).forEach(direction => {
      directionStats[direction] = {
        totalActivity: 0,
        closedActivity: 0,
        totalSub: 0,
        closedSub: 0,
        passedSub: 0,
        pendingSub: 0,
        retardSub: 0,
        closedSubOnTime: 0,
        livrableQualitySum: 0,
        validLivrableCount: 0,
        totalRessources: 0,
        totalBudget: 0,
        totalBudgetConsomme: 0,
        directionEffective: directionEffectives[direction] || 1
      };
    });

    // 🔹 Parcours des activités pour compléter les stats
    activities.forEach(activity => {
      const direction = activity.direction;
      if (!direction || !directionStats[direction]) return;

      const stats = directionStats[direction];
      stats.totalActivity++;

      if (['cloturé', 'terminé'].includes(activity.status?.toLowerCase())) {
        stats.closedActivity++;
      }

      const subs = activity.subactivities || [];
      stats.totalSub += subs.length;

      subs.forEach(sub => {
        const status = sub.status?.toLowerCase();

        if (status === 'cloturé') {
          stats.closedSub++;
          if (sub.deadlineRate === 1) stats.closedSubOnTime++;
          stats.totalRessources += sub.nbre_ressource ?? 0;
        }

        if (status === 'en retard') stats.retardSub++;
        if (status === 'en cours') stats.pendingSub++;
        if (status === 'dépassé') stats.passedSub++;

        if (sub.livrable?.livrableQuality != null) {
          stats.livrableQualitySum += sub.livrable.livrableQuality;
          stats.validLivrableCount++;
        }

        stats.totalBudget += sub.budget ?? 0;
        stats.totalBudgetConsomme += sub.budgetConsomme ?? 0;
      });
    });

    return Object.keys(directionStats).map(direction => {
      const s = directionStats[direction];

      const bonus =
        s.totalBudget > 0
          ? ((s.totalBudget - s.totalBudgetConsomme) / s.totalBudget) * 100
          : 0;

      let rateBudget =
        s.totalBudgetConsomme === 0
          ? 0
          : s.totalBudget <= s.totalBudgetConsomme
              ? (s.totalBudget / s.totalBudgetConsomme) * 100
              : 100 + bonus;

      rateBudget = Math.min(rateBudget, 110);

      return {
        direction,
        totalActivity: s.totalActivity,
        closedActivity: s.closedActivity,
        totalSub: s.totalSub,
        closedSub: s.closedSub,
        passedSub: s.passedSub,
        retardSub: s.retardSub,
        progression: s.totalSub > 0 ? Number((((s.closedSub + s.retardSub) / s.totalSub) * 100).toFixed(2)) : 0,
        kpi2_percent: s.closedSub > 0 ? Number(((s.closedSubOnTime / s.closedSub) * 100).toFixed(2)) : 0,
        kpi3_percent: s.validLivrableCount > 0 ? Number(((s.livrableQualitySum / s.validLivrableCount) * 100).toFixed(2)) : 0,
        kpi4_percent: s.totalSub > 0 && s.totalRessources > 0
          ? Number(((((s.closedSub / s.totalSub) / (s.totalRessources / s.directionEffective)) * (s.livrableQualitySum / 100)) * 100).toFixed(2))
          : 0,
        totalBudget: s.totalBudget,
        totalBudgetConsomme: s.totalBudgetConsomme,
        totalBudgetPrevu: s.totalBudget,
        totalBudgetConsommeVerifie: s.totalBudgetConsomme,
        kpi5_percent: Number(rateBudget.toFixed(2))
      };
    });
  } catch (error) {
    throw new BadRequestException(
      'Erreur lors du calcul des indicateurs',
      error.message
    );
  }
}




    
async getDirectionStats(annee: number): Promise<any[]> {
    try {
        const currentYear = annee || new Date().getFullYear();

        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

        // Liste de tous les statuts fixes comme tu les veux
        const allStatuses = ["cloturé", "dépassé", "en retard", "à faire", "en cours"];

        // Récupérer toutes les directions distinctes
        const allDirectionsRaw = await this.activityRepository
            .createQueryBuilder('activity')
            .select('DISTINCT activity.direction', 'direction')
            .getRawMany();

        // Initialiser les stats de toutes les directions avec tous les statuts à 0
        const directionStats: { [key: string]: { [status: string]: number } } = {};
        allDirectionsRaw.forEach(dir => {
            const name = dir.direction;
            if (name) {
                directionStats[name] = {};
                allStatuses.forEach(status => directionStats[name][status] = 0);
            }
        });

        // Récupérer toutes les activités avec sous-activités pour l'année
        const activities = await this.activityRepository.find({
            relations: ['subactivities'],
            where: {
                createdAt: Between(startOfYear, endOfYear),
            },
        });

        // Compter les statuts pour chaque direction
        activities.forEach(activity => {
            const directionName = activity.direction;
            if (!directionName) return;

            activity.subactivities?.forEach(subActivity => {
                const status = subActivity.status?.toLowerCase();
                if (status && directionStats[directionName]?.hasOwnProperty(status)) {
                    directionStats[directionName][status] += 1;
                }
            });
        });

        // Convertir en format final
        const result = Object.entries(directionStats).map(([direction, stats]) => ({
            direction,
            Stats: allStatuses.map(status => ({ status, nombre: stats[status] || 0 }))
        }));

        return result;
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
