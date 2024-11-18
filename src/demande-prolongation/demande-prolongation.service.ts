import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandeProlongation } from './entities/demande-prolongation.entity';
import { CreateDemandeProlongationDto } from './dto/create-demande-prolongation.dto';
import { UpdateDemandeProlongationDto } from './dto/update-demande-prolongation.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class DemandeProlongationService {
  constructor(
    @InjectRepository(DemandeProlongation)
    private readonly repository: Repository<DemandeProlongation>, // Injection du repository pour DemandeProlongation
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Injection du repository pour User
  ) {}

  // Méthode pour créer une demande de prolongation
  async create(dto: CreateDemandeProlongationDto) {
    try {
      // Recherche l'utilisateur avec l'ID fourni dans le DTO
      const user = await this.findOne(dto.userId);
      if (!user) throw new NotFoundException('Utilisateur non trouvé'); // Lancer une exception si l'utilisateur n'est pas trouvé

      // Crée une nouvelle instance de DemandeProlongation
      const entity = this.repository.create({
        ...dto,
        user, // Associe l'utilisateur trouvé à la demande
      });

      // Sauvegarde et retourne la demande créée
      return await this.repository.save(entity);
    } catch (error) {
      // Capture les erreurs et retourne un message d'erreur avec les détails
      throw new InternalServerErrorException('Échec de la création de la demande de prolongation', error.message);
    }
  }

  // Méthode pour récupérer toutes les demandes de prolongation
  async findAll() {
    try {
      // Récupère toutes les demandes de prolongation
      return await this.repository.find();
    } catch (error) {
      // Capture les erreurs et retourne un message d'erreur avec les détails
      throw new InternalServerErrorException('Échec de la récupération des demandes de prolongation', error.message);
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
}
