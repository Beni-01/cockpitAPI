import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { In, Repository } from 'typeorm';
import {
  CreateIcmTacheDto,
  FilterIcmTacheDashboardDto,
  FilterIcmTacheDto,
  ReturnIcmTacheLivrableDto,
  SubmitIcmTacheLivrableDto,
  UpdateIcmTacheDto,
} from '../dto';
import { IcmTache, IcmTacheLivrable } from '../entities';
import {
  IcmAssignmentScope,
  IcmPeriodicity,
  IcmTacheLivrableStatus,
} from '../enums';

const DEFAULT_DOMAINES = [
  'Ressources Humaines',
  'Logistique',
  'Finances',
  'Patrimoine',
  'Administration',
  'Gouvernance',
  'Sécurité',
  'Autres',
];

const DEFAULT_LIVRABLES = [
  'Rapport',
  'Compte rendu',
  'Procès-verbal',
  'Fiche de suivi',
  'Pièce justificative',
];

@Injectable()
export class IcmTacheService {
  constructor(
    @InjectRepository(IcmTache)
    private readonly icmTacheRepository: Repository<IcmTache>,
    @InjectRepository(IcmTacheLivrable)
    private readonly icmTacheLivrableRepository: Repository<IcmTacheLivrable>,
    @InjectRepository(Coordination)
    private readonly coordinationRepository: Repository<Coordination>,
  ) {}

  async create(dto: CreateIcmTacheDto): Promise<IcmTache> {
    try {
      const data = await this.prepareData(dto);
      const tache = this.icmTacheRepository.create({
        ...data,
        ordre: dto.ordre ?? 1,
        isActive: dto.isActive ?? true,
      });

      return await this.icmTacheRepository.save(tache);
    } catch (error) {
      this.rethrowKnownError(error);
      throw new InternalServerErrorException(
        `Erreur lors de la création de la tâche ICM: ${error.message}`,
      );
    }
  }

  async findAll(filterDto: FilterIcmTacheDto) {
    try {
      const {
        domaine,
        periodicite,
        search,
        isActive,
        page = 1,
        limit = 10,
      } = filterDto;

      const query = this.icmTacheRepository
        .createQueryBuilder('tache')
        .where('tache.deletedAt IS NULL');

      if (domaine) {
        query.andWhere('tache.domaine = :domaine', { domaine: domaine.trim() });
      }

      if (periodicite) {
        query.andWhere('tache.periodicite = :periodicite', { periodicite });
      }

      if (isActive !== undefined) {
        query.andWhere('tache.isActive = :isActive', { isActive });
      }

      if (search?.trim()) {
        query.andWhere(
          '(tache.tacheManageriale LIKE :search OR tache.domaine LIKE :search OR tache.livrableAttendu LIKE :search)',
          { search: `%${search.trim()}%` },
        );
      }

      const [data, total] = await query
        .orderBy('tache.ordre', 'ASC')
        .addOrderBy('tache.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des tâches ICM: ${error.message}`,
      );
    }
  }

  async findActiveByDomaine(domaine: string): Promise<IcmTache[]> {
    try {
      return await this.icmTacheRepository
        .createQueryBuilder('tache')
        .where('tache.deletedAt IS NULL')
        .andWhere('tache.isActive = :isActive', { isActive: true })
        .andWhere('tache.domaine = :domaine', { domaine: domaine.trim() })
        .orderBy('tache.ordre', 'ASC')
        .addOrderBy('tache.tacheManageriale', 'ASC')
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des tâches du domaine: ${error.message}`,
      );
    }
  }

  async findActiveByProvince(province: string) {
    const normalizedProvince = province?.trim();

    if (!normalizedProvince) {
      throw new BadRequestException('La province est requise.');
    }

    try {
      const [taches, coordinations] = await Promise.all([
        this.icmTacheRepository
          .createQueryBuilder('tache')
          .where('tache.deletedAt IS NULL')
          .andWhere('tache.isActive = :isActive', { isActive: true })
          .andWhere(
            `(
              tache.porteeAssignation = :allProvinces
              OR (
                tache.porteeAssignation = :specificProvinces
                AND JSON_CONTAINS(tache.provincesAssignees, :province)
              )
            )`,
            {
              allProvinces: IcmAssignmentScope.ALL_PROVINCES,
              specificProvinces: IcmAssignmentScope.SPECIFIC_PROVINCES,
              province: JSON.stringify(normalizedProvince),
            },
          )
          .orderBy('tache.ordre', 'ASC')
          .addOrderBy('tache.tacheManageriale', 'ASC')
          .getMany(),
        this.coordinationRepository
          .createQueryBuilder('coordination')
          .where('coordination.deletedAt IS NULL')
          .andWhere('LOWER(coordination.province) = LOWER(:province)', {
            province: normalizedProvince,
          })
          .orderBy('coordination.nom', 'ASC')
          .getMany(),
      ]);

      const tacheIds = taches.map((tache) => tache.id);
      const coordinationIds = coordinations.map(
        (coordination) => coordination.id,
      );
      const livrables =
        tacheIds.length > 0 && coordinationIds.length > 0
          ? await this.icmTacheLivrableRepository.find({
              where: {
                tacheId: In(tacheIds),
                coordinationId: In(coordinationIds),
                deletedAt: null,
              },
            })
          : [];
      const livrableMap = new Map(
        livrables.map((livrable) => [
          `${livrable.tacheId}:${livrable.coordinationId}`,
          livrable,
        ]),
      );
      const stats = {
        assignees: taches.length,
        enAttente: 0,
        soumis: 0,
        valides: 0,
        retournes: 0,
      };

      const data = taches.map((tache) => {
        const statutsCoordination = coordinations.map((coordination) => {
          const livrable = livrableMap.get(`${tache.id}:${coordination.id}`);

          return {
            coordinationId: coordination.id,
            coordination: coordination.nom,
            province: coordination.province,
            status: livrable?.status ?? IcmTacheLivrableStatus.NON_SOUMIS,
            livrableId: livrable?.id ?? null,
            nomFichier: livrable?.nomFichier ?? null,
            urlFichier: livrable?.urlFichier ?? null,
            motifRetour: livrable?.motifRetour ?? null,
            soumisLe: livrable?.soumisLe ?? null,
            traiteLe: livrable?.traiteLe ?? null,
          };
        });
        const status = this.resolveProvinceTaskStatus(statutsCoordination);

        if (status === IcmTacheLivrableStatus.VALIDE) {
          stats.valides += 1;
        } else if (status === IcmTacheLivrableStatus.SOUMIS) {
          stats.soumis += 1;
        } else {
          stats.enAttente += 1;
          if (status === IcmTacheLivrableStatus.RETOURNE) {
            stats.retournes += 1;
          }
        }

        return {
          ...tache,
          status,
          statutsCoordination,
        };
      });

      return {
        province: normalizedProvince,
        coordinations: coordinations.map((coordination) => ({
          id: coordination.id,
          nom: coordination.nom,
          province: coordination.province,
        })),
        stats,
        data,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des tâches de la province: ${error.message}`,
      );
    }
  }

  async getFormOptions() {
    try {
      const [domainRows, provinces] = await Promise.all([
        this.icmTacheRepository
          .createQueryBuilder('tache')
          .select('DISTINCT tache.domaine', 'domaine')
          .where('tache.deletedAt IS NULL')
          .orderBy('tache.domaine', 'ASC')
          .getRawMany<{ domaine: string }>(),
        this.getProvinces(),
      ]);

      const domaines = Array.from(
        new Set([
          ...DEFAULT_DOMAINES,
          ...domainRows.map((row) => row.domaine).filter(Boolean),
        ]),
      ).sort((a, b) => a.localeCompare(b, 'fr'));

      return {
        domaines,
        livrables: DEFAULT_LIVRABLES,
        periodicites: Object.values(IcmPeriodicity),
        porteesAssignation: Object.values(IcmAssignmentScope),
        provinces,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des options ICM: ${error.message}`,
      );
    }
  }

  async getProvinces(): Promise<string[]> {
    try {
      const [coordinationRows, taches] = await Promise.all([
        this.coordinationRepository
          .createQueryBuilder('coordination')
          .select('DISTINCT coordination.province', 'province')
          .where('coordination.deletedAt IS NULL')
          .andWhere('coordination.province IS NOT NULL')
          .getRawMany<{ province: string }>(),
        this.icmTacheRepository.find({
          select: { provincesAssignees: true },
          where: { deletedAt: null },
        }),
      ]);

      return Array.from(
        new Set(
          [
            ...coordinationRows.map((row) => row.province),
            ...taches.flatMap((tache) => tache.provincesAssignees ?? []),
          ]
            .map((province) => province?.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, 'fr'));
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des provinces ICM: ${error.message}`,
      );
    }
  }

  async getDashboard(filterDto: FilterIcmTacheDashboardDto) {
    try {
      const { coordinationId, domaine, dateDebut, dateFin, search } = filterDto;

      if (dateDebut && dateFin && dateDebut > dateFin) {
        throw new BadRequestException(
          'La fin de la période doit être postérieure ou égale au début.',
        );
      }

      const taskQuery = this.icmTacheRepository
        .createQueryBuilder('tache')
        .where('tache.deletedAt IS NULL')
        .andWhere('tache.isActive = :isActive', { isActive: true });

      if (domaine?.trim()) {
        taskQuery.andWhere('tache.domaine = :domaine', {
          domaine: domaine.trim(),
        });
      }

      if (dateDebut) {
        taskQuery.andWhere('tache.dateLimite >= :dateDebut', { dateDebut });
      }

      if (dateFin) {
        taskQuery.andWhere('tache.dateDebut <= :dateFin', { dateFin });
      }

      if (search?.trim()) {
        taskQuery.andWhere(
          '(tache.tacheManageriale LIKE :search OR tache.description LIKE :search OR tache.livrableAttendu LIKE :search)',
          { search: `%${search.trim()}%` },
        );
      }

      const [taches, coordinations] = await Promise.all([
        taskQuery
          .orderBy('tache.ordre', 'ASC')
          .addOrderBy('tache.createdAt', 'DESC')
          .getMany(),
        this.coordinationRepository.find({
          where: coordinationId
            ? { id: coordinationId, deletedAt: null }
            : { deletedAt: null },
          order: { nom: 'ASC' },
        }),
      ]);

      if (coordinationId && coordinations.length === 0) {
        throw new NotFoundException(
          `Coordination avec l’ID ${coordinationId} non trouvée`,
        );
      }

      const targetCoordinationIds = coordinations.map(
        (coordination) => coordination.id,
      );
      const tacheIds = taches.map((tache) => tache.id);
      const livrables =
        tacheIds.length && targetCoordinationIds.length
          ? await this.icmTacheLivrableRepository.find({
              where: {
                tacheId: In(tacheIds),
                coordinationId: In(targetCoordinationIds),
                deletedAt: null,
              },
              relations: ['coordination', 'soumissionnaire', 'validateur'],
            })
          : [];

      const livrableMap = new Map(
        livrables.map((livrable) => [
          `${livrable.tacheId}:${livrable.coordinationId}`,
          livrable,
        ]),
      );
      const statusTotals = this.createEmptyStatusTotals();

      const obligations = taches
        .map((tache) => {
          const assignedCoordinations = this.getAssignedCoordinations(
            tache,
            coordinations,
          );

          if (coordinationId && assignedCoordinations.length === 0) {
            return null;
          }

          const statutsCoordination = assignedCoordinations.map(
            (coordination) => {
              const livrable = livrableMap.get(
                `${tache.id}:${coordination.id}`,
              );
              const status =
                livrable?.status ?? IcmTacheLivrableStatus.NON_SOUMIS;
              statusTotals[status] += 1;

              return {
                coordinationId: coordination.id,
                coordination: coordination.nom,
                province: coordination.province,
                status,
                livrableId: livrable?.id ?? null,
                nomFichier: livrable?.nomFichier ?? null,
                urlFichier: livrable?.urlFichier ?? null,
                commentaire: livrable?.commentaire ?? null,
                motifRetour: livrable?.motifRetour ?? null,
                soumisLe: livrable?.soumisLe ?? null,
                traiteLe: livrable?.traiteLe ?? null,
              };
            },
          );

          const progression = this.buildProgression(statutsCoordination);

          return {
            id: tache.id,
            domaine: tache.domaine,
            periodicite: tache.periodicite,
            tacheManageriale: tache.tacheManageriale,
            description: tache.description,
            livrableAttendu: tache.livrableAttendu,
            dateDebut: tache.dateDebut,
            dateLimite: tache.dateLimite,
            porteeAssignation: tache.porteeAssignation,
            provincesAssignees: tache.provincesAssignees,
            instructionsSpecifiques: tache.instructionsSpecifiques,
            echeanceDepassee:
              tache.dateLimite < this.today() &&
              progression.valides < progression.total,
            progression,
            statutsCoordination,
          };
        })
        .filter(Boolean);

      const domaines = Array.from(
        obligations.reduce((map, obligation) => {
          map.set(obligation.domaine, (map.get(obligation.domaine) ?? 0) + 1);
          return map;
        }, new Map<string, number>()),
      ).map(([nom, total]) => ({ nom, total }));

      return {
        synthese: {
          obligationsCreees: obligations.length,
          affectations: Object.values(statusTotals).reduce(
            (total, value) => total + value,
            0,
          ),
          livrablesSoumis:
            statusTotals.SOUMIS + statusTotals.VALIDE + statusTotals.RETOURNE,
          valides: statusTotals.VALIDE,
          enAttente: statusTotals.SOUMIS,
          retournes: statusTotals.RETOURNE,
          nonSoumis: statusTotals.NON_SOUMIS,
        },
        filtres: {
          coordinationId: coordinationId ?? null,
          domaine: domaine ?? null,
          dateDebut: dateDebut ?? null,
          dateFin: dateFin ?? null,
        },
        domaines,
        coordinations: coordinations.map((coordination) => ({
          id: coordination.id,
          nom: coordination.nom,
          province: coordination.province,
        })),
        obligations,
      };
    } catch (error) {
      this.rethrowKnownError(error);
      throw new InternalServerErrorException(
        `Erreur lors de la récupération du dashboard des tâches ICM: ${error.message}`,
      );
    }
  }

  async findLivrablesByTache(id: number) {
    const tache = await this.findOne(id);
    const coordinations = await this.coordinationRepository.find({
      where: { deletedAt: null },
      order: { nom: 'ASC' },
    });
    const assignedCoordinations = this.getAssignedCoordinations(
      tache,
      coordinations,
    );
    const livrables = assignedCoordinations.length
      ? await this.icmTacheLivrableRepository.find({
          where: {
            tacheId: id,
            coordinationId: In(
              assignedCoordinations.map((coordination) => coordination.id),
            ),
            deletedAt: null,
          },
          relations: ['coordination', 'soumissionnaire', 'validateur'],
          order: { soumisLe: 'DESC' },
        })
      : [];
    const livrableByCoordination = new Map(
      livrables.map((livrable) => [livrable.coordinationId, livrable]),
    );

    return {
      tache,
      progression: this.buildProgression(
        assignedCoordinations.map((coordination) => ({
          status:
            livrableByCoordination.get(coordination.id)?.status ??
            IcmTacheLivrableStatus.NON_SOUMIS,
        })),
      ),
      data: assignedCoordinations.map((coordination) => ({
        coordination: {
          id: coordination.id,
          nom: coordination.nom,
          province: coordination.province,
        },
        status:
          livrableByCoordination.get(coordination.id)?.status ??
          IcmTacheLivrableStatus.NON_SOUMIS,
        livrable: livrableByCoordination.get(coordination.id) ?? null,
      })),
    };
  }

  async submitLivrable(
    tacheId: number,
    dto: SubmitIcmTacheLivrableDto,
    userId?: number,
  ): Promise<IcmTacheLivrable> {
    try {
      const [tache, coordination] = await Promise.all([
        this.findOne(tacheId),
        this.coordinationRepository.findOne({
          where: { id: dto.coordinationId, deletedAt: null },
        }),
      ]);

      if (!coordination) {
        throw new NotFoundException(
          `Coordination avec l’ID ${dto.coordinationId} non trouvée`,
        );
      }

      if (!this.isAssignedToCoordination(tache, coordination)) {
        throw new BadRequestException(
          'Cette tâche ICM n’est pas assignée à cette coordination.',
        );
      }

      let livrable = await this.icmTacheLivrableRepository.findOne({
        where: {
          tacheId,
          coordinationId: dto.coordinationId,
          deletedAt: null,
        },
      });

      if (livrable?.status === IcmTacheLivrableStatus.VALIDE) {
        throw new BadRequestException(
          'Un livrable validé ne peut plus être remplacé.',
        );
      }

      const data = {
        tacheId,
        coordinationId: dto.coordinationId,
        nomFichier: dto.nomFichier.trim(),
        urlFichier: dto.urlFichier.trim(),
        commentaire: dto.commentaire?.trim() || null,
        status: IcmTacheLivrableStatus.SOUMIS,
        soumisPar: userId ?? null,
        soumisLe: new Date(),
        traitePar: null,
        traiteLe: null,
        motifRetour: null,
      };

      livrable = livrable
        ? this.icmTacheLivrableRepository.merge(livrable, data)
        : this.icmTacheLivrableRepository.create(data);

      return await this.icmTacheLivrableRepository.save(livrable);
    } catch (error) {
      this.rethrowKnownError(error);
      throw new InternalServerErrorException(
        `Erreur lors de la soumission du livrable ICM: ${error.message}`,
      );
    }
  }

  async validateLivrable(
    livrableId: number,
    validatorId?: number,
  ): Promise<IcmTacheLivrable> {
    const livrable = await this.findLivrable(livrableId);

    if (livrable.status !== IcmTacheLivrableStatus.SOUMIS) {
      throw new BadRequestException(
        'Seul un livrable soumis peut être validé.',
      );
    }

    livrable.status = IcmTacheLivrableStatus.VALIDE;
    livrable.traitePar = validatorId ?? null;
    livrable.traiteLe = new Date();
    livrable.motifRetour = null;
    return this.icmTacheLivrableRepository.save(livrable);
  }

  async returnLivrable(
    livrableId: number,
    dto: ReturnIcmTacheLivrableDto,
    validatorId?: number,
  ): Promise<IcmTacheLivrable> {
    const livrable = await this.findLivrable(livrableId);

    if (livrable.status !== IcmTacheLivrableStatus.SOUMIS) {
      throw new BadRequestException(
        'Seul un livrable soumis peut être retourné.',
      );
    }

    livrable.status = IcmTacheLivrableStatus.RETOURNE;
    livrable.traitePar = validatorId ?? null;
    livrable.traiteLe = new Date();
    livrable.motifRetour = dto.motifRetour.trim();
    return this.icmTacheLivrableRepository.save(livrable);
  }

  async findOne(id: number): Promise<IcmTache> {
    try {
      const tache = await this.icmTacheRepository.findOne({
        where: { id, deletedAt: null },
      });

      if (!tache) {
        throw new NotFoundException(`Tâche ICM avec l’ID ${id} non trouvée`);
      }

      return tache;
    } catch (error) {
      this.rethrowKnownError(error);
      throw new InternalServerErrorException(
        `Erreur lors de la récupération de la tâche ICM: ${error.message}`,
      );
    }
  }

  async update(id: number, dto: UpdateIcmTacheDto): Promise<IcmTache> {
    try {
      const tache = await this.findOne(id);
      const data = await this.prepareData(dto, tache);

      Object.assign(tache, data);
      return await this.icmTacheRepository.save(tache);
    } catch (error) {
      this.rethrowKnownError(error);
      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour de la tâche ICM: ${error.message}`,
      );
    }
  }

  async toggleStatus(id: number): Promise<IcmTache> {
    try {
      const tache = await this.findOne(id);
      tache.isActive = !tache.isActive;
      return await this.icmTacheRepository.save(tache);
    } catch (error) {
      this.rethrowKnownError(error);
      throw new InternalServerErrorException(
        `Erreur lors de la modification du statut: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const tache = await this.findOne(id);
      await this.icmTacheRepository.softRemove(tache);
      return { message: 'Tâche ICM supprimée avec succès' };
    } catch (error) {
      this.rethrowKnownError(error);
      throw new InternalServerErrorException(
        `Erreur lors de la suppression de la tâche ICM: ${error.message}`,
      );
    }
  }

  private async prepareData(
    dto: CreateIcmTacheDto | UpdateIcmTacheDto,
    current?: IcmTache,
  ): Promise<Partial<IcmTache>> {
    const dateDebut = dto.dateDebut ?? current?.dateDebut;
    const dateLimite = dto.dateLimite ?? current?.dateLimite;

    if (dateDebut && dateLimite && dateDebut > dateLimite) {
      throw new BadRequestException(
        'La date limite doit être postérieure ou égale à la date de début.',
      );
    }

    const porteeAssignation =
      dto.porteeAssignation ??
      current?.porteeAssignation ??
      IcmAssignmentScope.ALL_PROVINCES;
    let provincesAssignees =
      dto.provincesAssignees !== undefined
        ? this.normalizeList(dto.provincesAssignees)
        : current?.provincesAssignees;

    if (porteeAssignation === IcmAssignmentScope.ALL_PROVINCES) {
      provincesAssignees = null;
    } else {
      if (!provincesAssignees?.length) {
        throw new BadRequestException(
          'Au moins une province est requise pour une assignation spécifique.',
        );
      }
      await this.validateProvinces(provincesAssignees);
    }

    const data: Partial<IcmTache> = {
      ...dto,
      porteeAssignation,
      provincesAssignees,
    };

    for (const field of [
      'domaine',
      'tacheManageriale',
      'description',
      'livrableAttendu',
      'instructionsSpecifiques',
    ] as const) {
      if (dto[field] !== undefined) {
        data[field] = dto[field]?.trim() || null;
      }
    }

    if (
      (data.domaine !== undefined && !data.domaine) ||
      (data.tacheManageriale !== undefined && !data.tacheManageriale) ||
      (data.livrableAttendu !== undefined && !data.livrableAttendu)
    ) {
      throw new BadRequestException(
        'Le domaine, la tâche managériale et le livrable attendu ne peuvent pas être vides.',
      );
    }

    return data;
  }

  private async validateProvinces(provinces: string[]): Promise<void> {
    const rows = await this.coordinationRepository
      .createQueryBuilder('coordination')
      .select('DISTINCT coordination.province', 'province')
      .where('coordination.deletedAt IS NULL')
      .andWhere('coordination.province IN (:...provinces)', { provinces })
      .getRawMany<{ province: string }>();

    const knownProvinces = new Set(rows.map((row) => row.province));
    const unknownProvinces = provinces.filter(
      (province) => !knownProvinces.has(province),
    );

    if (unknownProvinces.length) {
      throw new BadRequestException(
        `Province(s) inconnue(s): ${unknownProvinces.join(', ')}`,
      );
    }
  }

  private async findLivrable(id: number): Promise<IcmTacheLivrable> {
    const livrable = await this.icmTacheLivrableRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['tache', 'coordination', 'soumissionnaire', 'validateur'],
    });

    if (!livrable) {
      throw new NotFoundException(`Livrable ICM avec l’ID ${id} non trouvé`);
    }

    return livrable;
  }

  private getAssignedCoordinations(
    tache: IcmTache,
    coordinations: Coordination[],
  ): Coordination[] {
    if (tache.porteeAssignation === IcmAssignmentScope.ALL_PROVINCES) {
      return coordinations;
    }

    const assignedProvinces = new Set(tache.provincesAssignees ?? []);
    return coordinations.filter((coordination) =>
      assignedProvinces.has(coordination.province),
    );
  }

  private isAssignedToCoordination(
    tache: IcmTache,
    coordination: Coordination,
  ): boolean {
    return (
      tache.porteeAssignation === IcmAssignmentScope.ALL_PROVINCES ||
      (tache.provincesAssignees ?? []).includes(coordination.province)
    );
  }

  private buildProgression(items: Array<{ status: IcmTacheLivrableStatus }>) {
    const totals = this.createEmptyStatusTotals();
    items.forEach((item) => {
      totals[item.status] += 1;
    });

    return {
      total: items.length,
      traites: totals.SOUMIS + totals.VALIDE + totals.RETOURNE,
      soumis: totals.SOUMIS,
      valides: totals.VALIDE,
      retournes: totals.RETOURNE,
      nonSoumis: totals.NON_SOUMIS,
      pourcentageTraite:
        items.length > 0
          ? Math.round(
              ((totals.SOUMIS + totals.VALIDE + totals.RETOURNE) /
                items.length) *
                100,
            )
          : 0,
    };
  }

  private resolveProvinceTaskStatus(
    items: Array<{ status: IcmTacheLivrableStatus }>,
  ): IcmTacheLivrableStatus {
    if (items.length === 0) {
      return IcmTacheLivrableStatus.NON_SOUMIS;
    }

    if (items.every((item) => item.status === IcmTacheLivrableStatus.VALIDE)) {
      return IcmTacheLivrableStatus.VALIDE;
    }

    if (items.some((item) => item.status === IcmTacheLivrableStatus.RETOURNE)) {
      return IcmTacheLivrableStatus.RETOURNE;
    }

    if (items.some((item) => item.status === IcmTacheLivrableStatus.SOUMIS)) {
      return IcmTacheLivrableStatus.SOUMIS;
    }

    return IcmTacheLivrableStatus.NON_SOUMIS;
  }

  private createEmptyStatusTotals(): Record<IcmTacheLivrableStatus, number> {
    return {
      [IcmTacheLivrableStatus.NON_SOUMIS]: 0,
      [IcmTacheLivrableStatus.SOUMIS]: 0,
      [IcmTacheLivrableStatus.VALIDE]: 0,
      [IcmTacheLivrableStatus.RETOURNE]: 0,
    };
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private normalizeList(values: string[]): string[] {
    return Array.from(
      new Set(values.map((value) => value.trim()).filter(Boolean)),
    );
  }

  private rethrowKnownError(error: unknown): void {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
  }
}
