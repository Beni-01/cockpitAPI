import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IcmQuestion } from '../entities/icm-question.entity';
import {
  CreateIcmQuestionDto,
  UpdateIcmQuestionDto,
  FilterIcmQuestionDto,
} from '../dto';

@Injectable()
export class IcmQuestionService {
  constructor(
    @InjectRepository(IcmQuestion)
    private readonly icmQuestionRepository: Repository<IcmQuestion>,
  ) {}

  /**
   * Créer une nouvelle question ICM
   */
  async create(createIcmQuestionDto: CreateIcmQuestionDto): Promise<IcmQuestion> {
    try {
      const question = this.icmQuestionRepository.create(createIcmQuestionDto);
      return await this.icmQuestionRepository.save(question);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la création de la question ICM: ${error.message}`,
      );
    }
  }

  /**
   * Récupérer toutes les questions avec filtres et pagination
   */
  async findAll(filterDto: FilterIcmQuestionDto) {
    try {
      const { category, periodicity, isActive, page = 1, limit = 10 } = filterDto;

      let query = this.icmQuestionRepository
        .createQueryBuilder('question')
        .where('question.deletedAt IS NULL');

      if (category) {
        query = query.andWhere('question.category = :category', { category });
      }

      if (periodicity) {
        query = query.andWhere('question.periodicity = :periodicity', {
          periodicity,
        });
      }

      if (isActive !== undefined) {
        query = query.andWhere('question.isActive = :isActive', { isActive });
      }

      const total = await query.getCount();

      const questions = await query
        .orderBy('question.order', 'ASC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        data: questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des questions: ${error.message}`,
      );
    }
  }

  /**
   * Récupérer toutes les questions actives (sans pagination)
   */
  async findAllActive(): Promise<IcmQuestion[]> {
    try {
      return await this.icmQuestionRepository
        .createQueryBuilder('question')
        .where('question.isActive = :isActive', { isActive: true })
        .andWhere('question.deletedAt IS NULL')
        .orderBy('question.order', 'ASC')
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des questions actives: ${error.message}`,
      );
    }
  }

  /**
   * Récupérer une question par ID
   */
  async findOne(id: number): Promise<IcmQuestion> {
    try {
      const question = await this.icmQuestionRepository.findOne({
        where: { id, deletedAt: null },
      });

      if (!question) {
        throw new NotFoundException(`Question ICM avec l'ID ${id} non trouvée`);
      }

      return question;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la récupération de la question: ${error.message}`,
      );
    }
  }

  /**
   * Mettre à jour une question ICM
   */
  async update(id: number, updateIcmQuestionDto: UpdateIcmQuestionDto): Promise<IcmQuestion> {
    try {
      const question = await this.findOne(id);

      Object.assign(question, updateIcmQuestionDto);
      return await this.icmQuestionRepository.save(question);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour de la question: ${error.message}`,
      );
    }
  }

  /**
   * Activer/Désactiver une question
   */
  async toggleStatus(id: number): Promise<IcmQuestion> {
    try {
      const question = await this.findOne(id);
      question.isActive = !question.isActive;
      return await this.icmQuestionRepository.save(question);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la modification du statut: ${error.message}`,
      );
    }
  }

  /**
   * Supprimer (soft delete) une question
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      const question = await this.findOne(id);
      await this.icmQuestionRepository.softRemove(question);
      return { message: 'Question ICM supprimée avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la suppression de la question: ${error.message}`,
      );
    }
  }
}
