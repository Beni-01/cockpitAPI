import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandeProlongation } from './entities/demande-prolongation.entity';
import { CreateDemandeProlongationDto } from './dto/create-demande-prolongation.dto';
import { UpdateDemandeProlongationDto } from './dto/update-demande-prolongation.dto';
import { User } from '../user/entities/user.entity';
import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class DemandeProlongationService {
  constructor(
    @InjectRepository(DemandeProlongation)
    private readonly repository: Repository<DemandeProlongation>, // Injection du repository pour DemandeProlongation
     private readonly activityRepository:ActivityService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Injection du repository pour User
  ) {}

  // Méthode pour créer une demande de prolongation
  async create(dto: CreateDemandeProlongationDto) {
    try {
     
      // Crée une nouvelle instance de DemandeProlongation
      const entity = this.repository.create(dto);

      const activity = await this.activityRepository.findOne(dto.activityId);
  
      if (!activity) {
        throw new NotFoundException('Activité non trouvée');
      }
  
      // Sauvegarde et retourne la demande créée
      const demandSaved= await this.repository.save(entity);

      activity.status = 'cloturé';
      await this.activityRepository.update(dto.activityId, { status: "Reprogrammé" });


      return demandSaved
      
    } catch (error) {
      // Capture les erreurs et retourne un message d'erreur avec les détails
      throw new InternalServerErrorException('Échec de la création de la demande de prolongation', error.message);
    }
  }

  async findAll() {
    try {
      // Récupère toutes les demandes de prolongation et inclut les données de l'entité "activity"
      return await this.repository.find({
        relations: ['activity'], // Spécifie le nom de la relation
      });
    } catch (error) {
      // Capture les erreurs et retourne un message d'erreur avec les détails
      throw new InternalServerErrorException(
        'Échec de la récupération des demandes de prolongation',
        error.message,
      );
    }
  }

  async getStatDemandeByStatus(): Promise<any> {
    try {
      // Obtenez les totaux par statut
      const rawResult = await this.repository
        .createQueryBuilder('demande')
        .select('demande.reponse', 'status')
        .addSelect('COUNT(*)', 'total')
        .addSelect('ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2)', 'percentage') // Précision à deux décimale
        .groupBy('demande.reponse')
        .getRawMany();
  
          // Transformez les résultats en un format avec des nombres
      const result = rawResult.map((row) => ({
      status: row.status,
      total: Number(row.total), // Convertir en nombre
      percentage: parseFloat(row.percentage), // Convertir en nombre
    }));

      return result;
    } catch (error) {
      
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des livrables.',
      );
    }
  }
  

  // Méthode pour récupérer une demande de prolongation par son ID
  async findOne(id: number) {
    try {
      // Recherche la demande de prolongation par son ID
      const entity = await this.repository.findOne({where:{id}});
      if (!entity) throw new NotFoundException('Demande de prolongation non trouvée'); // Lancer une exception si la demande n'est pas trouvée
      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Relancer l'exception NotFoundException si l'entité n'est pas trouvée
      }
      // Capture les erreurs générales et retourne un message d'erreur avec les détails
      throw new InternalServerErrorException('Échec de la récupération de la demande de prolongation', error.message);
    }
  }

  async update(id: number, dto: UpdateDemandeProlongationDto) {
    try {
      // Vérifier si la demande de prolongation existe
      const existingEntity = await this.findOne(id);
      if (!existingEntity) {
        throw new NotFoundException('Demande de prolongation non trouvée');
      }
  
      // Si un userId est fourni, on vérifie et met à jour l'utilisateur
      if (dto.userId) {
        const user = await this.findOne(dto.userId);
        if (!user) {
          throw new NotFoundException('Utilisateur non trouvé');
        }
  
        // Mettre à jour le champ user dans la demande
        dto.userId = user.id;
      }
  
      // Utilisation de la méthode update de TypeORM pour mettre à jour directement l'entité dans la base
      await this.repository.update(id, dto);
  
      // Retourner l'entité mise à jour
      return this.findOne(id);
  
    } catch (error) {
      // Relancer l'exception NotFoundException ou une erreur générique
      throw new InternalServerErrorException('Échec de la mise à jour de la demande de prolongation', error.message);
    }
  }
  

  // Méthode pour supprimer une demande de prolongation par son ID
  async remove(id: number) {
    try {
      // Recherche la demande de prolongation à supprimer par son ID
      const entity = await this.findOne(id);
      if (!entity) throw new NotFoundException('Demande de prolongation non trouvée'); // Lancer une exception si la demande n'est pas trouvée

      // Supprime la demande et retourne le résultat
      return await this.repository.remove(entity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Relancer l'exception NotFoundException si la demande n'est pas trouvée
      }
      // Capture les erreurs générales et retourne un message d'erreur avec les détails
      throw new InternalServerErrorException('Échec de la suppression de la demande de prolongation', error.message);
    }
  }


  async getProlongationsByActivityDirectionWithStatusAndPercentage() {
    try {
      // Calculer le total global des demandes
      const totalDemandesGlobal = await this.repository
        .createQueryBuilder('demandes')
        .select('COUNT(demandes.id)', 'total')
        .getRawOne();
  
      const totalDemandes = totalDemandesGlobal.total;
  
      // Requête pour obtenir les demandes par direction et statut
      const result = await this.repository
        .createQueryBuilder('demandes') // Alias pour les demandes
        .leftJoinAndSelect('demandes.activity', 'activity') // Jointure avec l'entité Activity
        .select('activity.direction', 'direction') // Sélectionne la direction dans Activity
        .addSelect('demandes.reponse', 'status') // Sélectionne le statut des demandes (réponse)
        .addSelect('COUNT(demandes.id)', 'nombreDemandes') // Compte les demandes
        .addSelect(
          `(COUNT(demandes.id) * 100.0 / :totalDemandes)`,
          'pourcentage' // Utilisation du total global pour calculer le pourcentage
        )
        .groupBy('activity.direction') // Regroupe par direction
        .addGroupBy('demandes.reponse') // Regroupe aussi par statut
        .setParameter('totalDemandes', totalDemandes) // Passe la valeur du total global
        .getRawMany(); // Retourne les résultats bruts
  
      // Formatage des résultats pour structurer par direction et statuts
      const formattedResult = result.reduce((acc, row) => {
        const direction = row.direction || 'Non spécifié';
  
        // Trouver ou créer l'entrée pour la direction
        let directionData = acc.find((d) => d.direction === direction);
        if (!directionData) {
          directionData = {
            direction,
            totalDemandes: 0,
            demandesParStatus: [],
            pourcentage: 0,
          };
          acc.push(directionData);
        }
  
        // Ajouter le statut et les détails associés
        directionData.demandesParStatus.push({
          status: row.status || 'Non spécifié',
          nombreDemandes: Number(row.nombreDemandes),
          pourcentage: parseFloat(row.pourcentage).toFixed(2),
        });
  
        // Incrémenter le total de demandes pour cette direction
        directionData.totalDemandes += Number(row.nombreDemandes);
  
        // Calculer le pourcentage global de la direction
        directionData.pourcentage = (
          (directionData.totalDemandes / totalDemandes) * 100
        ).toFixed(2);
  
        return acc;
      }, []);
  
      return formattedResult;
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors du calcul des demandes par direction, statut et pourcentage.',
      );
    }
  }
  
  
}
