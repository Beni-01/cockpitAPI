import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePassationMarcheDto, PassationMarchePaginationDto } from './dto/create-passation-marche.dto';
import { UpdatePassationMarcheDto } from './dto/update-passation-marche.dto';
import { PassationMarche } from './entities/passation-marche.entity';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class PassationMarcheService {
  constructor(
    @InjectRepository(PassationMarche)
    private readonly passationMarcheRepository: Repository<PassationMarche>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

     private readonly dataSource: DataSource,
  ) {}

  async create(createPassationMarcheDto: CreatePassationMarcheDto) {
    try {

      const passationMarche = this.passationMarcheRepository.create({
        ...createPassationMarcheDto
      });

      return await this.passationMarcheRepository.save(passationMarche);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the passation',
      );
    }
  }


async createBulk(dtos: CreatePassationMarcheDto[]) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const cleanedDtos = dtos.map((dto) => {
      const cleanedDto = {} as CreatePassationMarcheDto;

      for (const key in dto) {
        if (Object.prototype.hasOwnProperty.call(dto, key)) {
          const value = dto[key];

          if (typeof value === 'string') {
            // Nettoyage des chaînes de caractères
            cleanedDto[key] = value.trim();
          } else if (
            typeof value === 'number' ||
            (typeof value === 'string' && !isNaN(Number(value)))
          ) {
            // Conversion des strings numériques avec espaces → number
            cleanedDto[key] = parseFloat(String(value).trim());
          } else {
            cleanedDto[key] = value;
          }
        }
      }

      return cleanedDto;
    });

    const entities = cleanedDtos.map(dto =>
      this.passationMarcheRepository.create(dto),
    );

    for (const entity of entities) {
      await queryRunner.manager.save(entity);
    }

    await queryRunner.commitTransaction();
    return entities;
  } catch (error) {

    
    
    await queryRunner.rollbackTransaction();

    return error    

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'An error occurred while creating multiple passations',
    );

    

    
  } finally {
    await queryRunner.release();
  }
}



  async findAll(paginationDto:  PassationMarchePaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const [data, total] = await this.passationMarcheRepository.findAndCount({
        relations: ['user'],
        skip,
        take: limit,
      });

      return {
        data,
        meta: {
          total,
          page,
          limit,
          last_page: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching passations',
      );
    }
  }

  async findOne(id: number) {
    try {
      const passationMarche = await this.passationMarcheRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!passationMarche) {
        throw new NotFoundException(
          `PassationMarche with ID ${id} not found`,
        );
      }

      return passationMarche;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the passation',
      );
    }
  }

  async update(id: number, updatePassationMarcheDto: UpdatePassationMarcheDto) {
    try {
      const passationMarche = await this.findOne(id);

      if (updatePassationMarcheDto.userId) {
        const user = await this.userRepository.findOne({
          where: { id: updatePassationMarcheDto.userId },
        });

        if (!user) {
          throw new NotFoundException(
            `User with ID ${updatePassationMarcheDto.userId} not found`,
          );
        }

        passationMarche.user = user;
      }

      Object.assign(passationMarche, updatePassationMarcheDto);

      return await this.passationMarcheRepository.save(passationMarche);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the passation',
      );
    }
  }

  async remove(id: number) {
    try {
      const result = await this.passationMarcheRepository.softDelete(id);

      if (result.affected === 0) {
        throw new NotFoundException(
          `PassationMarche with ID ${id} not found`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the passation',
      );
    }
  }
}