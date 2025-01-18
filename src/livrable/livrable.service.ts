import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateLivrableDto } from './dto/create-livrable.dto';
import { UpdateLivrableDto } from './dto/update-livrable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livrable } from './entities/livrable.entity';

@Injectable()
export class LivrableService {
  constructor(
    @InjectRepository(Livrable)
    private readonly livrableRepository: Repository<Livrable>,
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
        .addSelect('ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2)', 'percentage')
        .groupBy('livrable.status')
        .getRawMany();
  
          // Transformez les résultats en un format avec des nombres
      const result = rawResult.map((row) => ({
      status: row.status,
      total: Number(row.total), // Convertir en nombre
      percentage: Number(row.percentage), // Convertir en nombre
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
}
