import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateLivrableDto } from './dto/create-livrable.dto';
import { UpdateLivrableDto } from './dto/update-livrable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livrable } from './entities/livrable.entity';
import { UserService } from 'src/user/user.service';
import { UserLivrableService } from 'src/user-livrable/user-livrable.service';

@Injectable()
export class LivrableService {
  constructor(
    @InjectRepository(Livrable)
    private readonly livrableRepository: Repository<Livrable>,

    private  readonly agentValidateurService: UserLivrableService,

    private  readonly userService: UserService,
  ) {}

  async create(createLivrableDto: CreateLivrableDto): Promise<Livrable> {
    try {
      const livrable = this.livrableRepository.create(createLivrableDto);
      return await this.livrableRepository.save(livrable);
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création du livrable.',
      );
    }
  }


  async saveFormWithValidateur(livrableId:number){

    const validateurs=await this.userService.getUsersByFunction()

    validateurs?.data?.forEach(async (validateur:any)=>{
     const createAgentValidateurDto={
       livrableId,
       userId:validateur.id
     }
     return await this.agentValidateurService.create(createAgentValidateurDto)
    })
    
 }

  async findAll(): Promise<Livrable[]> {
    try {
      return await this.livrableRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des livrables.',
      );
    }
  }

  async getStatLivrableByStatus(): Promise<any> {
    try {
      // Obtenez les totaux par statut
      const rawResult = await this.livrableRepository
        .createQueryBuilder('livrable')
        .select('livrable.status', 'status')
        .addSelect('COUNT(*)', 'total')
        .addSelect('ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2)', 'percentage') // Précision à deux décimale
        .groupBy('livrable.status')
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
  

  async findOne(id: number): Promise<Livrable> {
    try {
      const livrable = await this.livrableRepository.findOne({ where: { id } });
      if (!livrable) {
        throw new NotFoundException(`Le livrable avec l'id ${id} n'existe pas.`);
      }
      return livrable;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Laisser passer les erreurs "NotFoundException"
      }
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération du livrable.',
      );
    }
  }

  async update(
    id: number,
    updateLivrableDto: Partial<CreateLivrableDto>,
  ): Promise<Livrable> {
    try {
      const livrable = await this.findOne(id);
      Object.assign(livrable, updateLivrableDto);
      return await this.livrableRepository.save(livrable);
    } catch (error) {
      throw new InternalServerErrorException(
        `Une erreur est survenue lors de la mise à jour du livrable avec l'id ${id}.`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const livrable = await this.findOne(id);
      await this.livrableRepository.softRemove(livrable);
    } catch (error) {
      throw new InternalServerErrorException(
        `Une erreur est survenue lors de la suppression du livrable avec l'id ${id}.`,
      );
    }
  }


  async getLivrablesByActivityDirectionWithStatusAndPercentage() {
    try {
      // Calculer le total global des livrables
      const totalLivrablesGlobal = await this.livrableRepository
        .createQueryBuilder('livrables')
        .select('COUNT(livrables.id)', 'total')
        .getRawOne();
  
      const totalLivrables = totalLivrablesGlobal.total;
  
      // Requête pour obtenir les livrables par direction et statut
      const result = await this.livrableRepository
        .createQueryBuilder('livrables') // Alias pour les livrables
        .leftJoinAndSelect('livrables.activity', 'activity') // Jointure avec l'entité Activity
        .select('activity.direction', 'direction') // Sélectionne la direction dans Activity
        .addSelect('livrables.status', 'status') // Sélectionne le statut des livrables
        .addSelect('COUNT(livrables.id)', 'nombreLivrables') // Compte les livrables
        .addSelect(
          `(COUNT(livrables.id) * 100.0 / :totalLivrables)`,
          'pourcentage' // Utilisation du total global pour calculer le pourcentage
        )
        .groupBy('activity.direction') // Regroupe par direction
        .addGroupBy('livrables.status') // Regroupe aussi par statut
        .setParameter('totalLivrables', totalLivrables) // Passe la valeur du total global
        .getRawMany(); // Retourne les résultats bruts
  
      // Formatage des résultats pour structurer par direction et statuts
      const formattedResult = result.reduce((acc, row) => {
        const direction = row.direction || 'Non spécifié';
  
        // Trouver ou créer l'entrée pour la direction
        let directionData = acc.find((d) => d.direction === direction);
        if (!directionData) {
          directionData = {
            direction,
            totalLivrables: 0,
            livrablesParStatus: [],
            pourcentage: 0,
          };
          acc.push(directionData);
        }
  
        // Ajouter le statut et les détails associés
        directionData.livrablesParStatus.push({
          status: row.status || 'Non spécifié',
          nombreLivrables: Number(row.nombreLivrables),
          pourcentage: parseFloat(row.pourcentage).toFixed(2),
        });
  
        // Incrémenter le total de livrables pour cette direction
        directionData.totalLivrables += Number(row.nombreLivrables);
  
        // Calculer le pourcentage global de la direction
        directionData.pourcentage = (
          (directionData.totalLivrables / totalLivrables) * 100
        ).toFixed(2);
  
        return acc;
      }, []);
  
      return formattedResult;
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors du calcul des livrables par direction, statut et pourcentage.',
      );
    }
  }
  
  
}
