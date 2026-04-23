import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TresorerieMouvement, TypeMouvement } from './entities/tresorerie.entity';
import { CreateTresorerieDto } from './dto/create-tresorerie.dto';
import { UpdateTresorerieDto } from './dto/update-tresorerie.dto';
import { QueryTresorerieDto } from './dto/query-tresorerie.dto';

// ── Interfaces de réponse standardisées ─────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface TresorerieSummary {
  soldeCourant: number;
  totalEntrees: number;
  totalSorties: number;
  nombreMouvements: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class TresorerieService {
  private readonly logger = new Logger(TresorerieService.name);

  constructor(
    @InjectRepository(TresorerieMouvement)
    private readonly tresorerieRepository: Repository<TresorerieMouvement>,
    private readonly dataSource: DataSource,
  ) {}

  // ── CREATE ─────────────────────────────────────────────────────────────────

  /**
   * Crée un nouveau mouvement de trésorerie en transaction.
   * Calcule automatiquement le solde après l'opération si non fourni.
   */
  async create(dto: CreateTresorerieDto): Promise<TresorerieMouvement> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // Vérifier la référence FED unique
        if (dto.referenceFed) {
          const existing = await manager.findOne(TresorerieMouvement, {
            where: { referenceFed: dto.referenceFed },
          });
          if (existing) {
            throw new BadRequestException(
              `Un mouvement avec la référence FED "${dto.referenceFed}" existe déjà (ID: ${existing.id}).`,
            );
          }
        }

        // Calculer le solde après si non fourni
        let soldeApres = dto.soldeApres;
        if (soldeApres === undefined || soldeApres === null) {
          const dernierMouvement = await manager.findOne(TresorerieMouvement, {
            order: { dateOperation: 'DESC', id: 'DESC' },
          });

          const soldePrecedent = dernierMouvement
            ? Number(dernierMouvement.soldeApres) || 0
            : 0;

          soldeApres =
            dto.typeMouvement === TypeMouvement.ENTREE
              ? soldePrecedent + Number(dto.montant)
              : soldePrecedent - Number(dto.montant);

          if (soldeApres < 0) {
            throw new BadRequestException(
              `Solde insuffisant. Solde actuel : ${soldePrecedent} FC, Montant demandé : ${dto.montant} FC.`,
            );
          }
        }

        const mouvement = manager.create(TresorerieMouvement, {
          ...dto,
          devise: dto.devise ?? 'FC',
          soldeApres,
        });

        const saved = await manager.save(TresorerieMouvement, mouvement);
        this.logger.log(
          `Mouvement créé : ID=${saved.id} | ${saved.typeMouvement} | ${saved.montant} FC | Coordination: ${saved.coordination}`,
        );
        return saved;
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        this.logger.error('Erreur lors de la création du mouvement', error?.stack);
        throw new InternalServerErrorException(
          'Une erreur est survenue lors de la création du mouvement de trésorerie.',
        );
      }
    });
  }

  // ── FIND ALL (filtré + paginé) ────────────────────────────────────────────

  /**
   * Retourne tous les mouvements avec filtres optionnels sur chaque champ
   * et pagination (page, limit).
   */
  async findAll(query: QueryTresorerieDto): Promise<PaginatedResult<TresorerieMouvement>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 10));
      const skip = (page - 1) * limit;

      const qb = this.tresorerieRepository
        .createQueryBuilder('m')
        .orderBy('m.dateOperation', 'DESC')
        .addOrderBy('m.id', 'DESC');

      // ── Filtres dynamiques ────────────────────────────────────────────────

      if (query.typeMouvement) {
        qb.andWhere('m.typeMouvement = :typeMouvement', {
          typeMouvement: query.typeMouvement,
        });
      }

      if (query.coordination) {
        qb.andWhere('m.coordination LIKE :coordination', {
          coordination: `%${query.coordination}%`,
        });
      }

      if (query.motif) {
        qb.andWhere('m.motif LIKE :motif', {
          motif: `%${query.motif}%`,
        });
      }

      if (query.referenceFed) {
        qb.andWhere('m.referenceFed LIKE :referenceFed', {
          referenceFed: `%${query.referenceFed}%`,
        });
      }

      if (query.beneficiaire) {
        qb.andWhere('m.beneficiaire LIKE :beneficiaire', {
          beneficiaire: `%${query.beneficiaire}%`,
        });
      }

      if (query.agentSaisi) {
        qb.andWhere('m.agentSaisi LIKE :agentSaisi', {
          agentSaisi: `%${query.agentSaisi}%`,
        });
      }

      if (query.devise) {
        qb.andWhere('m.devise = :devise', { devise: query.devise });
      }

      if (query.dateDebut) {
        qb.andWhere('m.dateOperation >= :dateDebut', {
          dateDebut: query.dateDebut,
        });
      }

      if (query.dateFin) {
        qb.andWhere('m.dateOperation <= :dateFin', {
          dateFin: query.dateFin,
        });
      }

      if (query.montantMin !== undefined) {
        qb.andWhere('m.montant >= :montantMin', {
          montantMin: query.montantMin,
        });
      }

      if (query.montantMax !== undefined) {
        qb.andWhere('m.montant <= :montantMax', {
          montantMax: query.montantMax,
        });
      }

      // ── Pagination ────────────────────────────────────────────────────────

      qb.skip(skip).take(limit);

      const [data, totalItems] = await qb.getManyAndCount();

      return {
        data,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / limit)),
        },
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des mouvements', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de récupérer les mouvements de trésorerie.',
      );
    }
  }

  // ── FIND ONE ───────────────────────────────────────────────────────────────

  async findOne(id: number): Promise<TresorerieMouvement> {
    try {
      const mouvement = await this.tresorerieRepository.findOne({
        where: { id },
      });

      if (!mouvement) {
        throw new NotFoundException(
          `Mouvement de trésorerie avec l'ID ${id} introuvable.`,
        );
      }

      return mouvement;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur findOne(id=${id})`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de récupérer le mouvement de trésorerie.',
      );
    }
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────

  /**
   * Met à jour partiellement un mouvement. Vérifie l'unicité de referenceFed
   * si modifiée.
   */
  async update(id: number, dto: UpdateTresorerieDto): Promise<TresorerieMouvement> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const mouvement = await manager.findOne(TresorerieMouvement, {
          where: { id },
        });

        if (!mouvement) {
          throw new NotFoundException(
            `Mouvement de trésorerie avec l'ID ${id} introuvable.`,
          );
        }

        // Vérifier unicité de la référence FED si modifiée
        if (dto.referenceFed && dto.referenceFed !== mouvement.referenceFed) {
          const conflict = await manager.findOne(TresorerieMouvement, {
            where: { referenceFed: dto.referenceFed },
          });
          if (conflict) {
            throw new BadRequestException(
              `La référence FED "${dto.referenceFed}" est déjà utilisée (ID: ${conflict.id}).`,
            );
          }
        }

        const updated = manager.merge(TresorerieMouvement, mouvement, dto);
        const saved = await manager.save(TresorerieMouvement, updated);

        this.logger.log(
          `Mouvement mis à jour : ID=${saved.id} | ${saved.typeMouvement} | ${saved.montant} FC`,
        );
        return saved;
      } catch (error) {
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException
        )
          throw error;
        this.logger.error(`Erreur update(id=${id})`, error?.stack);
        throw new InternalServerErrorException(
          'Impossible de mettre à jour le mouvement de trésorerie.',
        );
      }
    });
  }

  // ── SOFT DELETE ─────────────────────────────────────────────────────────────

  async remove(id: number): Promise<{ message: string }> {
    try {
      const mouvement = await this.tresorerieRepository.findOne({
        where: { id },
      });

      if (!mouvement) {
        throw new NotFoundException(
          `Mouvement de trésorerie avec l'ID ${id} introuvable.`,
        );
      }

      await this.tresorerieRepository.softDelete(id);
      this.logger.log(`Mouvement supprimé (soft) : ID=${id}`);
      return { message: `Mouvement ID=${id} supprimé avec succès.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur remove(id=${id})`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de supprimer le mouvement de trésorerie.',
      );
    }
  }

  // ── RESTORE (annuler suppression) ──────────────────────────────────────────

  async restore(id: number): Promise<{ message: string }> {
    try {
      const result = await this.tresorerieRepository.restore(id);
      if (!result.affected || result.affected === 0) {
        throw new NotFoundException(
          `Mouvement ID=${id} introuvable ou non supprimé.`,
        );
      }
      this.logger.log(`Mouvement restauré : ID=${id}`);
      return { message: `Mouvement ID=${id} restauré avec succès.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur restore(id=${id})`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de restaurer le mouvement.',
      );
    }
  }

  // ── SYNTHÈSE / RÉSUMÉ ──────────────────────────────────────────────────────

  /**
   * Retourne le résumé de la trésorerie :
   * solde courant, total entrées, total sorties, nombre de mouvements.
   * Peut être filtré par coordination et/ou plage de dates.
   */
  async getSummary(
    coordination?: string,
    dateDebut?: string,
    dateFin?: string,
  ): Promise<TresorerieSummary> {
    try {
      const qb = this.tresorerieRepository
        .createQueryBuilder('m')
        .select([
          `SUM(CASE WHEN m.typeMouvement = 'entree' THEN m.montant ELSE 0 END)`,
          'totalEntrees',
          `SUM(CASE WHEN m.typeMouvement = 'sortie' THEN m.montant ELSE 0 END)`,
          'totalSorties',
          'COUNT(m.id)',
          'nombreMouvements',
        ]);

      if (coordination) {
        qb.andWhere('m.coordination LIKE :coordination', {
          coordination: `%${coordination}%`,
        });
      }
      if (dateDebut) {
        qb.andWhere('m.dateOperation >= :dateDebut', { dateDebut });
      }
      if (dateFin) {
        qb.andWhere('m.dateOperation <= :dateFin', { dateFin });
      }

      const raw = await this.tresorerieRepository
        .createQueryBuilder('m')
        .select(
          `SUM(CASE WHEN m.typeMouvement = 'entree' THEN m.montant ELSE 0 END)`,
          'totalEntrees',
        )
        .addSelect(
          `SUM(CASE WHEN m.typeMouvement = 'sortie' THEN m.montant ELSE 0 END)`,
          'totalSorties',
        )
        .addSelect('COUNT(m.id)', 'nombreMouvements')
        .where(coordination ? 'm.coordination LIKE :coordination' : '1=1', {
          coordination: coordination ? `%${coordination}%` : undefined,
        })
        .andWhere(dateDebut ? 'm.dateOperation >= :dateDebut' : '1=1', {
          dateDebut,
        })
        .andWhere(dateFin ? 'm.dateOperation <= :dateFin' : '1=1', {
          dateFin,
        })
        .getRawOne();

      const totalEntrees = Number(raw?.totalEntrees) || 0;
      const totalSorties = Number(raw?.totalSorties) || 0;

      return {
        soldeCourant: totalEntrees - totalSorties,
        totalEntrees,
        totalSorties,
        nombreMouvements: Number(raw?.nombreMouvements) || 0,
      };
    } catch (error) {
      this.logger.error('Erreur getSummary()', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de calculer le résumé de trésorerie.',
      );
    }
  }

  // ── SYNTHÈSE PAR COORDINATION ─────────────────────────────────────────────

  /**
   * Retourne une synthèse agrégée par coordination.
   */
  async getSyntheseParCoordination(
    dateDebut?: string,
    dateFin?: string,
  ): Promise<any[]> {
    try {
      const qb = this.tresorerieRepository
        .createQueryBuilder('m')
        .select('m.coordination', 'coordination')
        .addSelect(
          `SUM(CASE WHEN m.typeMouvement = 'entree' THEN m.montant ELSE 0 END)`,
          'totalEntrees',
        )
        .addSelect(
          `SUM(CASE WHEN m.typeMouvement = 'sortie' THEN m.montant ELSE 0 END)`,
          'totalSorties',
        )
        .addSelect(
          `SUM(CASE WHEN m.typeMouvement = 'entree' THEN m.montant ELSE 0 END)
           - SUM(CASE WHEN m.typeMouvement = 'sortie' THEN m.montant ELSE 0 END)`,
          'solde',
        )
        .addSelect('COUNT(m.id)', 'nombreMouvements')
        .groupBy('m.coordination')
        .orderBy('solde', 'DESC');

      if (dateDebut) {
        qb.andWhere('m.dateOperation >= :dateDebut', { dateDebut });
      }
      if (dateFin) {
        qb.andWhere('m.dateOperation <= :dateFin', { dateFin });
      }

      const rows = await qb.getRawMany();

      return rows.map((r) => ({
        coordination: r.coordination,
        totalEntrees: Number(r.totalEntrees),
        totalSorties: Number(r.totalSorties),
        solde: Number(r.solde),
        nombreMouvements: Number(r.nombreMouvements),
      }));
    } catch (error) {
      this.logger.error('Erreur getSyntheseParCoordination()', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de calculer la synthèse par coordination.',
      );
    }
  }
}
