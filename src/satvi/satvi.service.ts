import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, SelectQueryBuilder, Repository } from 'typeorm';
import {
  CreateSatviDto,
  CreateSatviMissionDto,
  QuerySatviDto,
  QuerySatviMissionDto,
  SatviMissionSortBy,
  SatviSortBy,
  SubmitSatviMissionQuestionnaireDto,
  UpdateSatviDto,
} from './dto';
import {
  SatviEvaluation,
  SatviQuestionnaire,
  SatviStatus,
} from './entities/satvi-questionnaire.entity';
import {
  SatviInvitationStatus,
  SatviMission,
  SatviMissionInvitation,
  SatviMissionStatus,
} from './entities';

const EVALUATION_KEYS: Array<keyof SatviEvaluation> = [
  'qualiteAccueil',
  'dispositionsLogistiques',
  'disponibiliteEquipeCoordination',
  'organisationGenerale',
  'missionPrepareeCoordonnee',
  'contraintesPrisesEnCharge',
  'collaborationAgentsProvinciaux',
  'implicationEquipesLocales',
  'reactiviteEquipesLocales',
  'professionnalismeCoordination',
  'echangesFluidesRespectueux',
  'pertinenceAppuiCoordination',
  'recommandationModeleBonnePratique',
  'recommandationCoordinationBonExemple',
];

const SORT_COLUMNS: Record<SatviSortBy, string> = {
  [SatviSortBy.CREATED_AT]: 'q.createdAt',
  [SatviSortBy.PERIODE_DU]: 'q.periodeDu',
  [SatviSortBy.PERIODE_AU]: 'q.periodeAu',
  [SatviSortBy.SCORE_GLOBAL]: 'q.scoreGlobal',
  [SatviSortBy.EVALUATION_AVERAGE]: 'q.evaluationAverage',
  [SatviSortBy.APPRECIATION_GLOBALE]: 'q.appreciationGlobale',
};

const MISSION_SORT_COLUMNS: Record<SatviMissionSortBy, string> = {
  [SatviMissionSortBy.CREATED_AT]: 'mission.createdAt',
  [SatviMissionSortBy.DATE_DEBUT]: 'mission.dateDebut',
  [SatviMissionSortBy.DATE_FIN]: 'mission.dateFin',
  [SatviMissionSortBy.TITRE]: 'mission.titre',
  [SatviMissionSortBy.STATUS]: 'mission.status',
};

interface SatviCriterionDefinition {
  code: string;
  label: string;
  keys: Array<keyof SatviEvaluation>;
}

const CRITERIA: SatviCriterionDefinition[] = [
  {
    code: 'accueil_prise_en_charge',
    label: 'Accueil et prise en charge',
    keys: [
      'qualiteAccueil',
      'dispositionsLogistiques',
      'disponibiliteEquipeCoordination',
    ],
  },
  {
    code: 'organisation_coordination',
    label: 'Organisation, coordination et fonctionnement',
    keys: [
      'organisationGenerale',
      'missionPrepareeCoordonnee',
      'contraintesPrisesEnCharge',
    ],
  },
  {
    code: 'collaboration_appui_terrain',
    label: 'Collaboration et appui terrain',
    keys: [
      'collaborationAgentsProvinciaux',
      'implicationEquipesLocales',
      'reactiviteEquipesLocales',
    ],
  },
  {
    code: 'gouvernance_professionnalisme',
    label: 'Gouvernance et professionnalisme',
    keys: ['professionnalismeCoordination', 'echangesFluidesRespectueux'],
  },
  {
    code: 'appreciation_recommandation',
    label: 'Appreciation globale et recommandations',
    keys: [
      'pertinenceAppuiCoordination',
      'recommandationModeleBonnePratique',
      'recommandationCoordinationBonExemple',
    ],
  },
];

export interface SatviPaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface SatviSummary {
  totalQuestionnaires: number;
  scoreGlobalMoyen: number;
  evaluationMoyenne: number;
  appreciationMoyenne: number;
  totalAlertes: number;
  tauxAlerte: number;
}

export interface SatviDashboardOverview {
  evaluations: number;
  scoreMoyen: number;
  scoreLabel: string;
  provinces: number;
  alertesActives: number;
}

export interface SatviDashboardEvaluationRow {
  id: number;
  missionId: number;
  referenceCode: string;
  province: string;
  directionTechnique: string;
  mission: string;
  periode: {
    du: string;
    au: string;
    label: string;
  };
  score: number;
  scoreLabel: string;
  statut: 'OK' | 'ALERTE';
  status: SatviStatus;
  dysfonctionnementMajeur: boolean;
  createdAt: Date;
}

export interface SatviCriterionScore {
  code: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  scoreLabel: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
}

export interface SatviEvaluationDetail {
  id: number;
  referenceCode: string;
  score: number;
  scoreLabel: string;
  maxScore: number;
  scorePercentage: number;
  identification: {
    directionTechnique: string;
    province: string;
    periode: {
      du: string;
      au: string;
      label: string;
      labelFr: string;
    };
    type: string;
    typeLabel: string;
  };
  scoresParCritere: SatviCriterionScore[];
  appreciationDirecte: SatviCriterionScore;
  analyseQualitative: {
    pointsForts: string;
    aspectAccueilAmeliorer: string;
    difficulteOrganisationnelle: string;
    ameliorationCollaborationTerrain: string;
    faiblessesObservees: string;
    recommandations: string;
  };
  alerte: {
    active: boolean;
    description: string;
  };
  status: SatviStatus;
  soumisLe: Date;
  soumisLeLabel: string;
  evaluation: SatviEvaluation;
}

export interface SatviMissionRow {
  id: number;
  referenceCode: string;
  titre: string;
  description: string;
  province: string;
  coordination: {
    id: number;
    nom: string;
  };
  typeMission: string;
  typeMissionLabel: string;
  periode: {
    du: string;
    au: string;
    label: string;
    labelFr: string;
  };
  status: SatviMissionStatus;
  invites: number;
  evaluations: number;
  scoreMoyen: number;
  scoreLabel: string;
  alertesActives: number;
  createdAt: Date;
}

export interface SatviMissionPublicPayload {
  mission: {
    id: number;
    referenceCode: string;
    titre: string;
    description: string;
    province: string;
    coordination: string;
    typeMission: string;
    typeMissionLabel: string;
    periode: {
      du: string;
      au: string;
      labelFr: string;
    };
  };
  questions: any[];
}

@Injectable()
export class SatviService {
  private readonly logger = new Logger(SatviService.name);

  constructor(
    @InjectRepository(SatviQuestionnaire)
    private readonly satviRepository: Repository<SatviQuestionnaire>,
    @InjectRepository(SatviMission)
    private readonly missionRepository: Repository<SatviMission>,
    @InjectRepository(SatviMissionInvitation)
    private readonly invitationRepository: Repository<SatviMissionInvitation>,
    @InjectRepository(Coordination)
    private readonly coordinationRepository: Repository<Coordination>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSatviDto): Promise<SatviQuestionnaire> {
    try {
      const normalizedInput = this.normalizeQuestionnaireFields(dto);
      const normalizedDto = normalizedInput.missionId
        ? await this.withMissionIdentification(normalizedInput, normalizedInput.missionId)
        : normalizedInput;

      this.validateDates(normalizedDto.periodeDu, normalizedDto.periodeAu);

      const computed = this.computeScores(
        normalizedDto.evaluation,
        normalizedDto.appreciationGlobale,
      );
      const status = normalizedDto.status ?? SatviStatus.SOUMIS;
      const questionnaire = this.satviRepository.create({
        ...normalizedDto,
        ...computed,
        status,
        submittedAt: status === SatviStatus.SOUMIS ? new Date() : null,
      });

      questionnaire.referenceCode = await this.generateReferenceCode();

      const saved = await this.satviRepository.save(questionnaire);
      this.logger.log(`Questionnaire SatVi cree: ID=${saved.id}, ref=${saved.referenceCode}`);
      return saved;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Erreur creation SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de creer le questionnaire SatVi.',
      );
    }
  }

  async createMission(
    dto: CreateSatviMissionDto,
    createdBy?: number,
  ): Promise<{
    mission: SatviMissionRow;
    invitations: SatviMissionInvitation[];
  }> {
    try {
      this.validateDates(dto.dateDebut, dto.dateFin);

      const coordination = await this.coordinationRepository.findOne({
        where: { id: dto.coordinationId },
      });
      if (!coordination) {
        throw new NotFoundException(
          `Coordination avec l'ID ${dto.coordinationId} introuvable.`,
        );
      }

      const missionnaireIds = [...new Set(dto.missionnaireIds)];
      const missionnaires = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id IN (:...ids)', { ids: missionnaireIds })
        .getMany();

      if (missionnaires.length !== missionnaireIds.length) {
        const foundIds = missionnaires.map((user) => user.id);
        const missingIds = missionnaireIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `Missionnaire(s) introuvable(s): ${missingIds.join(', ')}.`,
        );
      }

      const mission = this.missionRepository.create({
        referenceCode: await this.generateMissionReferenceCode(),
        titre: dto.titre,
        description: dto.description,
        dateDebut: dto.dateDebut,
        dateFin: dto.dateFin,
        coordinationId: coordination.id,
        coordinationNom: coordination.nom,
        province: coordination.province,
        typeMission: dto.typeMission,
        typeMissionAutre: dto.typeMissionAutre,
        status: SatviMissionStatus.ACTIVE,
        createdBy,
        sentAt: new Date(),
      });

      const savedMission = await this.missionRepository.save(mission);

      const invitations = await Promise.all(
        missionnaires.map(async (missionnaire) => {
          const token = await this.generateInvitationToken();
          const invitation = this.invitationRepository.create({
            missionId: savedMission.id,
            userId: missionnaire.id,
            nomComplet: this.getUserFullName(missionnaire),
            email: missionnaire.email,
            direction: missionnaire.direction ?? missionnaire.service,
            token,
            invitationLink: this.buildInvitationLink(token, dto.publicBaseUrl),
            status: SatviInvitationStatus.PREPAREE,
          });

          return await this.invitationRepository.save(invitation);
        }),
      );

      const sentInvitations = await Promise.all(
        invitations.map((invitation) => this.sendMissionInvitation(savedMission, invitation)),
      );

      return {
        mission: await this.getMissionRow(savedMission.id),
        invitations: sentInvitations,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Erreur creation mission SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de creer la mission SatVi.',
      );
    }
  }

  async findMissions(
    query: QuerySatviMissionDto,
  ): Promise<SatviPaginatedResult<SatviMissionRow>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 10));
      const skip = (page - 1) * limit;

      const qb = this.missionRepository.createQueryBuilder('mission');
      this.applyMissionFilters(qb, query);

      const sortBy = query.sortBy ?? SatviMissionSortBy.CREATED_AT;
      const sortColumn =
        MISSION_SORT_COLUMNS[sortBy] ??
        MISSION_SORT_COLUMNS[SatviMissionSortBy.CREATED_AT];
      const sortOrder = query.sortOrder ?? 'DESC';

      qb.orderBy(sortColumn, sortOrder)
        .addOrderBy('mission.id', 'DESC')
        .skip(skip)
        .take(limit);

      const [missions, totalItems] = await qb.getManyAndCount();
      const data = await Promise.all(
        missions.map((mission) => this.toMissionRow(mission)),
      );

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
      this.logger.error('Erreur liste missions SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de recuperer les missions SatVi.',
      );
    }
  }

  async findMissionOne(id: number) {
    const mission = await this.missionRepository.findOne({
      where: { id },
      relations: ['invitations'],
    });

    if (!mission) {
      throw new NotFoundException(`Mission SatVi avec l'ID ${id} introuvable.`);
    }

    const row = await this.toMissionRow(mission);
    return {
      ...row,
      invitations: mission.invitations,
    };
  }

  async findMissionSubmissions(
    missionId: number,
    query: QuerySatviDto,
  ): Promise<{
    mission: SatviMissionRow;
    soumissions: SatviPaginatedResult<SatviDashboardEvaluationRow>;
  }> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
    });

    if (!mission) {
      throw new NotFoundException(
        `Mission SatVi avec l'ID ${missionId} introuvable.`,
      );
    }

    const result = await this.getDashboardEvaluations({
      ...query,
      missionId,
    });

    return {
      mission: await this.toMissionRow(mission),
      soumissions: result,
    };
  }

  async getMissionPublicByToken(token: string): Promise<SatviMissionPublicPayload> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ['mission'],
    });

    if (!invitation || !invitation.mission) {
      throw new NotFoundException('Lien SatVi invalide ou introuvable.');
    }

    if (
      invitation.status === SatviInvitationStatus.UTILISEE ||
      invitation.usedAt
    ) {
      throw new ConflictException(
        'Ce lien SatVi a deja ete utilise. Chaque lien est valable une seule fois.',
      );
    }

    const mission = invitation.mission;
    if (mission.status !== SatviMissionStatus.ACTIVE) {
      throw new BadRequestException('Cette mission SatVi n est pas active.');
    }

    return {
      mission: {
        id: mission.id,
        referenceCode: mission.referenceCode,
        titre: mission.titre,
        description: mission.description,
        province: mission.province,
        coordination: mission.coordinationNom,
        typeMission: mission.typeMission,
        typeMissionLabel: this.getMissionTypeLabel(mission.typeMission),
        periode: {
          du: mission.dateDebut,
          au: mission.dateFin,
          labelFr: `${this.formatDateFr(mission.dateDebut)} -> ${this.formatDateFr(mission.dateFin)}`,
        },
      },
      questions: this.getQuestions(),
    };
  }

  async submitMissionQuestionnaire(
    token: string,
    dto: SubmitSatviMissionQuestionnaireDto,
    requestMeta?: { ipAddress?: string; userAgent?: string },
  ): Promise<SatviEvaluationDetail> {
    const questionnaire = await this.dataSource.transaction(async (manager) => {
      const invitation = await manager.findOne(SatviMissionInvitation, {
        where: { token },
        relations: ['mission'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!invitation || !invitation.mission) {
        throw new NotFoundException('Lien SatVi invalide ou introuvable.');
      }

      if (
        invitation.status === SatviInvitationStatus.UTILISEE ||
        invitation.usedAt
      ) {
        throw new ConflictException(
          'Ce lien SatVi a deja ete utilise. Chaque lien est valable une seule fois.',
        );
      }

      const mission = invitation.mission;
      if (mission.status !== SatviMissionStatus.ACTIVE) {
        throw new BadRequestException('Cette mission SatVi n est pas active.');
      }

      const payload: CreateSatviDto = this.normalizeQuestionnaireFields({
        ...dto,
        missionId: mission.id,
        directionMetier: mission.coordinationNom,
        provinceVisitee: mission.province,
        periodeDu: mission.dateDebut,
        periodeAu: mission.dateFin,
        typeMission: mission.typeMission,
        typeMissionAutre: mission.typeMissionAutre,
        ipAddress: requestMeta?.ipAddress,
        userAgent: requestMeta?.userAgent,
      });

      this.validateDates(payload.periodeDu, payload.periodeAu);
      const computed = this.computeScores(
        payload.evaluation,
        payload.appreciationGlobale,
      );
      const status = payload.status ?? SatviStatus.SOUMIS;

      const questionnaireToSave = manager.create(SatviQuestionnaire, {
        ...payload,
        ...computed,
        status,
        referenceCode: await this.generateReferenceCode(),
        submittedAt: status === SatviStatus.SOUMIS ? new Date() : null,
      });

      const savedQuestionnaire = await manager.save(
        SatviQuestionnaire,
        questionnaireToSave,
      );

      invitation.status = SatviInvitationStatus.UTILISEE;
      invitation.usedAt = new Date();
      await manager.save(SatviMissionInvitation, invitation);

      return savedQuestionnaire;
    });

    return this.toEvaluationDetail(questionnaire);
  }

  async archiveMission(id: number): Promise<SatviMissionRow> {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      throw new NotFoundException(`Mission SatVi avec l'ID ${id} introuvable.`);
    }

    mission.status = SatviMissionStatus.ARCHIVEE;
    await this.missionRepository.save(mission);
    return this.toMissionRow(mission);
  }

  async closeMission(id: number): Promise<SatviMissionRow> {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      throw new NotFoundException(`Mission SatVi avec l'ID ${id} introuvable.`);
    }

    mission.status = SatviMissionStatus.CLOTUREE;
    await this.missionRepository.save(mission);
    return this.toMissionRow(mission);
  }

  async getMissionFormOptions(search?: string) {
    const [coordinations, missionnaires] = await Promise.all([
      this.searchCoordinations(search),
      this.searchMissionnaires(search),
    ]);

    return {
      coordinations,
      missionnaires,
      typesMission: [
        { value: 'suivi', label: 'Suivi' },
        { value: 'appui_technique', label: 'Appui technique' },
        { value: 'controle', label: 'Controle' },
        { value: 'autre', label: 'Autre' },
      ],
    };
  }

  async searchCoordinations(search?: string) {
    const qb = this.coordinationRepository
      .createQueryBuilder('coordination')
      .orderBy('coordination.nom', 'ASC')
      .take(20);

    if (search) {
      qb.where(
        '(coordination.nom LIKE :search OR coordination.province LIKE :search OR coordination.type LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const rows = await qb.getMany();
    return rows.map((coordination) => ({
      id: coordination.id,
      nom: coordination.nom,
      province: coordination.province,
      type: coordination.type,
      status: coordination.status,
    }));
  }

  async searchMissionnaires(search?: string) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: true })
      .orderBy('user.nom', 'ASC')
      .take(50);

    if (search) {
      qb.andWhere(
        '(user.nom LIKE :search OR user.postnom LIKE :search OR user.prenom LIKE :search OR user.email LIKE :search OR user.direction LIKE :search OR user.service LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const rows = await qb.getMany();
    return rows.map((user) => ({
      id: user.id,
      nomComplet: this.getUserFullName(user),
      email: user.email,
      direction: user.direction ?? user.service,
      fonction: user.fonction,
    }));
  }

  async findAll(query: QuerySatviDto): Promise<SatviPaginatedResult<SatviQuestionnaire>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 10));
      const skip = (page - 1) * limit;

      const qb = this.satviRepository.createQueryBuilder('q');
      this.applyFilters(qb, query);

      const sortBy = query.sortBy ?? SatviSortBy.CREATED_AT;
      const sortColumn = SORT_COLUMNS[sortBy] ?? SORT_COLUMNS[SatviSortBy.CREATED_AT];
      const sortOrder = query.sortOrder ?? 'DESC';

      qb.orderBy(sortColumn, sortOrder).addOrderBy('q.id', 'DESC').skip(skip).take(limit);

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
      this.logger.error('Erreur liste SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de recuperer les questionnaires SatVi.',
      );
    }
  }

  async findOne(id: number): Promise<SatviQuestionnaire> {
    try {
      const questionnaire = await this.satviRepository.findOne({ where: { id } });
      if (!questionnaire) {
        throw new NotFoundException(`Questionnaire SatVi avec l'ID ${id} introuvable.`);
      }

      return questionnaire;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur findOne SatVi id=${id}`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de recuperer le questionnaire SatVi.',
      );
    }
  }

  async findByReference(referenceCode: string): Promise<SatviQuestionnaire> {
    try {
      const questionnaire = await this.satviRepository.findOne({
        where: { referenceCode },
      });

      if (!questionnaire) {
        throw new NotFoundException(
          `Questionnaire SatVi avec la reference ${referenceCode} introuvable.`,
        );
      }

      return questionnaire;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur findByReference SatVi ref=${referenceCode}`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de recuperer le questionnaire SatVi.',
      );
    }
  }

  async getDetail(id: number): Promise<SatviEvaluationDetail> {
    const questionnaire = await this.findOne(id);
    return this.toEvaluationDetail(questionnaire);
  }

  async getDetailByReference(referenceCode: string): Promise<SatviEvaluationDetail> {
    const questionnaire = await this.findByReference(referenceCode);
    return this.toEvaluationDetail(questionnaire);
  }

  async update(id: number, dto: UpdateSatviDto): Promise<SatviQuestionnaire> {
    try {
      const questionnaire = await this.findOne(id);
      const normalizedDto = this.normalizeQuestionnaireFields(dto);

      const periodeDu = normalizedDto.periodeDu ?? questionnaire.periodeDu;
      const periodeAu = normalizedDto.periodeAu ?? questionnaire.periodeAu;
      this.validateDates(periodeDu, periodeAu);

      const evaluation = normalizedDto.evaluation
        ? { ...questionnaire.evaluation, ...normalizedDto.evaluation }
        : questionnaire.evaluation;
      const appreciationGlobale =
        normalizedDto.appreciationGlobale ?? questionnaire.appreciationGlobale;
      const computed = this.computeScores(evaluation, appreciationGlobale);
      const status = normalizedDto.status ?? questionnaire.status;

      const updated = this.satviRepository.merge(questionnaire, {
        ...normalizedDto,
        evaluation,
        ...computed,
        status,
        submittedAt:
          status === SatviStatus.SOUMIS && !questionnaire.submittedAt
            ? new Date()
            : questionnaire.submittedAt,
      });

      const saved = await this.satviRepository.save(updated);
      this.logger.log(`Questionnaire SatVi mis a jour: ID=${saved.id}`);
      return saved;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Erreur update SatVi id=${id}`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de mettre a jour le questionnaire SatVi.',
      );
    }
  }

  async submit(id: number): Promise<SatviQuestionnaire> {
    const questionnaire = await this.findOne(id);

    if (questionnaire.status === SatviStatus.ARCHIVE) {
      throw new BadRequestException(
        'Un questionnaire archive ne peut pas etre soumis.',
      );
    }

    questionnaire.status = SatviStatus.SOUMIS;
    questionnaire.submittedAt = questionnaire.submittedAt ?? new Date();
    return await this.satviRepository.save(questionnaire);
  }

  async archive(id: number): Promise<SatviQuestionnaire> {
    const questionnaire = await this.findOne(id);
    questionnaire.status = SatviStatus.ARCHIVE;
    return await this.satviRepository.save(questionnaire);
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.findOne(id);
      await this.satviRepository.softDelete(id);
      this.logger.log(`Questionnaire SatVi supprime: ID=${id}`);
      return { message: `Questionnaire SatVi ID=${id} supprime avec succes.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur remove SatVi id=${id}`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de supprimer le questionnaire SatVi.',
      );
    }
  }

  async restore(id: number): Promise<{ message: string }> {
    try {
      const result = await this.satviRepository.restore(id);
      if (!result.affected) {
        throw new NotFoundException(
          `Questionnaire SatVi ID=${id} introuvable ou non supprime.`,
        );
      }

      return { message: `Questionnaire SatVi ID=${id} restaure avec succes.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur restore SatVi id=${id}`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de restaurer le questionnaire SatVi.',
      );
    }
  }

  async getSummary(query: QuerySatviDto): Promise<SatviSummary> {
    try {
      const qb = this.satviRepository
        .createQueryBuilder('q')
        .select('COUNT(q.id)', 'totalQuestionnaires')
        .addSelect('AVG(q.scoreGlobal)', 'scoreGlobalMoyen')
        .addSelect('AVG(q.evaluationAverage)', 'evaluationMoyenne')
        .addSelect('AVG(q.appreciationGlobale)', 'appreciationMoyenne')
        .addSelect(
          'SUM(CASE WHEN q.dysfonctionnementMajeur = true THEN 1 ELSE 0 END)',
          'totalAlertes',
        );

      this.applyFilters(qb, query);
      const raw = await qb.getRawOne();

      const totalQuestionnaires = Number(raw?.totalQuestionnaires) || 0;
      const totalAlertes = Number(raw?.totalAlertes) || 0;

      return {
        totalQuestionnaires,
        scoreGlobalMoyen: this.round(Number(raw?.scoreGlobalMoyen) || 0),
        evaluationMoyenne: this.round(Number(raw?.evaluationMoyenne) || 0),
        appreciationMoyenne: this.round(Number(raw?.appreciationMoyenne) || 0),
        totalAlertes,
        tauxAlerte:
          totalQuestionnaires > 0
            ? this.round((totalAlertes / totalQuestionnaires) * 100)
            : 0,
      };
    } catch (error) {
      this.logger.error('Erreur summary SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de calculer les statistiques SatVi.',
      );
    }
  }

  async getStatsByProvince(query: QuerySatviDto) {
    return await this.getGroupedStats(query, 'q.provinceVisitee', 'provinceVisitee');
  }

  async getStatsByDirection(query: QuerySatviDto) {
    return await this.getGroupedStats(query, 'q.directionMetier', 'directionMetier');
  }

  async getDashboard(query: QuerySatviDto) {
    const [overview, evaluations, parProvince, provinces, missions] = await Promise.all([
      this.getDashboardOverview(query),
      this.getDashboardEvaluations(query),
      this.getDashboardByProvince(query),
      this.getProvinces(query),
      this.findMissions({ page: query.page, limit: query.limit }),
    ]);

    return {
      overview,
      evaluations,
      parProvince,
      provinces,
      missions,
    };
  }

  async getDashboardOverview(query: QuerySatviDto): Promise<SatviDashboardOverview> {
    try {
      const qb = this.satviRepository
        .createQueryBuilder('q')
        .select('COUNT(q.id)', 'evaluations')
        .addSelect('AVG(q.scoreGlobal)', 'scoreMoyen')
        .addSelect('COUNT(DISTINCT q.provinceVisitee)', 'provinces')
        .addSelect(
          'SUM(CASE WHEN q.dysfonctionnementMajeur = true THEN 1 ELSE 0 END)',
          'alertesActives',
        );

      this.applyFilters(qb, query);
      const raw = await qb.getRawOne();
      const scoreMoyen = this.round(Number(raw?.scoreMoyen) || 0);

      return {
        evaluations: Number(raw?.evaluations) || 0,
        scoreMoyen,
        scoreLabel: this.getScoreLabel(scoreMoyen),
        provinces: Number(raw?.provinces) || 0,
        alertesActives: Number(raw?.alertesActives) || 0,
      };
    } catch (error) {
      this.logger.error('Erreur dashboard overview SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de recuperer les indicateurs du dashboard SatVi.',
      );
    }
  }

  async getDashboardEvaluations(
    query: QuerySatviDto,
  ): Promise<SatviPaginatedResult<SatviDashboardEvaluationRow>> {
    const result = await this.findAll(query);

    return {
      data: result.data.map((questionnaire) =>
        this.toDashboardEvaluationRow(questionnaire),
      ),
      pagination: result.pagination,
    };
  }

  async getDashboardByProvince(query: QuerySatviDto) {
    try {
      const qb = this.satviRepository
        .createQueryBuilder('q')
        .select('q.provinceVisitee', 'province')
        .addSelect('COUNT(q.id)', 'evaluations')
        .addSelect('AVG(q.scoreGlobal)', 'scoreMoyen')
        .addSelect('COUNT(DISTINCT q.directionMetier)', 'directions')
        .addSelect(
          'SUM(CASE WHEN q.dysfonctionnementMajeur = true THEN 1 ELSE 0 END)',
          'alertesActives',
        )
        .addSelect('MAX(q.periodeAu)', 'derniereEvaluation')
        .groupBy('q.provinceVisitee')
        .orderBy('scoreMoyen', 'DESC');

      this.applyFilters(qb, query);
      const rows = await qb.getRawMany();

      return rows.map((row) => {
        const scoreMoyen = this.round(Number(row.scoreMoyen) || 0);

        return {
          province: row.province,
          evaluations: Number(row.evaluations) || 0,
          scoreMoyen,
          scoreLabel: this.getScoreLabel(scoreMoyen),
          directions: Number(row.directions) || 0,
          alertesActives: Number(row.alertesActives) || 0,
          derniereEvaluation: row.derniereEvaluation,
        };
      });
    } catch (error) {
      this.logger.error('Erreur dashboard par province SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de recuperer le dashboard SatVi par province.',
      );
    }
  }

  async getProvinces(query: QuerySatviDto): Promise<string[]> {
    try {
      const qb = this.satviRepository
        .createQueryBuilder('q')
        .select('DISTINCT q.provinceVisitee', 'province')
        .orderBy('q.provinceVisitee', 'ASC');

      const filtersWithoutProvince = { ...query };
      delete filtersWithoutProvince.province;
      delete filtersWithoutProvince.provinceVisitee;
      this.applyFilters(qb, filtersWithoutProvince);

      const rows = await qb.getRawMany();
      return rows.map((row) => row.province).filter(Boolean);
    } catch (error) {
      this.logger.error('Erreur liste provinces SatVi', error?.stack);
      throw new InternalServerErrorException(
        'Impossible de recuperer les provinces SatVi.',
      );
    }
  }

  getQuestions() {
    return [
      {
        code: 'I',
        key: 'accueil_prise_en_charge',
        titre: 'Accueil et prise en charge',
        questions: [
          this.ratingQuestion(1, 'qualiteAccueil'),
          this.ratingQuestion(2, 'dispositionsLogistiques'),
          this.ratingQuestion(3, 'disponibiliteEquipeCoordination'),
          {
            key: 'aspectAccueilAmeliorer',
            numero: 4,
            type: 'text',
            libelle: "Quel aspect de l'accueil pourrait etre ameliore selon vous ?",
          },
        ],
      },
      {
        code: 'II',
        key: 'organisation_coordination_fonctionnement',
        titre: 'Organisation, coordination et fonctionnement',
        questions: [
          this.ratingQuestion(5, 'organisationGenerale'),
          this.ratingQuestion(6, 'missionPrepareeCoordonnee'),
          this.ratingQuestion(7, 'contraintesPrisesEnCharge'),
          {
            key: 'difficulteOrganisationnelle',
            numero: 8,
            type: 'text',
            libelle:
              'Avez-vous rencontre une difficulte organisationnelle ? Si oui, laquelle ?',
          },
        ],
      },
      {
        code: 'III',
        key: 'collaboration_appui_terrain',
        titre: 'Collaboration et appui terrain',
        questions: [
          this.ratingQuestion(9, 'collaborationAgentsProvinciaux'),
          this.ratingQuestion(10, 'implicationEquipesLocales'),
          this.ratingQuestion(11, 'reactiviteEquipesLocales'),
          {
            key: 'ameliorationCollaborationTerrain',
            numero: 12,
            type: 'text',
            libelle:
              'Que pourrait-on ameliorer pour renforcer la collaboration sur le terrain ?',
          },
        ],
      },
      {
        code: 'IV',
        key: 'gouvernance_professionnalisme',
        titre: 'Gouvernance et professionnalisme',
        questions: [
          this.ratingQuestion(13, 'professionnalismeCoordination'),
          this.ratingQuestion(14, 'echangesFluidesRespectueux'),
          {
            key: 'dysfonctionnementMajeur',
            numero: 15,
            type: 'boolean',
            libelle:
              'Avez-vous observe des difficultes organisationnelles ou des vulnerabilites importantes ?',
            detailKey: 'descriptionDysfonctionnement',
            detailLibelle: 'Si oui, veuillez preciser.',
          },
        ],
      },
      {
        code: 'V',
        key: 'appreciation_globale',
        titre: 'Appreciation globale',
        questions: [
          {
            key: 'appreciationGlobale',
            numero: 16,
            type: 'rating',
            min: 1,
            max: 5,
            libelle:
              'Quel est votre niveau global de satisfaction concernant cette mission ?',
          },
          this.ratingQuestion(17, 'pertinenceAppuiCoordination'),
          {
            key: 'recommandationModeleBonnePratique',
            numero: 18,
            type: 'choice_score',
            libelle:
              'Recommanderiez-vous le fonctionnement actuel de cette Coordination Provinciale comme modele de bonne pratique ?',
            options: [
              { label: 'Non', score: 1 },
              { label: 'Partiellement', score: 3 },
              { label: 'Oui', score: 5 },
            ],
          },
        ],
      },
      {
        code: 'VI',
        key: 'recommandations',
        titre: 'Recommandations',
        questions: [
          this.ratingQuestion(19, 'recommandationCoordinationBonExemple'),
        ],
      },
    ];
  }

  private async getGroupedStats(
    query: QuerySatviDto,
    groupColumn: string,
    alias: string,
  ) {
    try {
      const qb = this.satviRepository
        .createQueryBuilder('q')
        .select(groupColumn, alias)
        .addSelect('COUNT(q.id)', 'totalQuestionnaires')
        .addSelect('AVG(q.scoreGlobal)', 'scoreGlobalMoyen')
        .addSelect('AVG(q.evaluationAverage)', 'evaluationMoyenne')
        .addSelect(
          'SUM(CASE WHEN q.dysfonctionnementMajeur = true THEN 1 ELSE 0 END)',
          'totalAlertes',
        )
        .groupBy(groupColumn)
        .orderBy('scoreGlobalMoyen', 'DESC');

      this.applyFilters(qb, query);
      const rows = await qb.getRawMany();

      return rows.map((row) => ({
        [alias]: row[alias],
        totalQuestionnaires: Number(row.totalQuestionnaires) || 0,
        scoreGlobalMoyen: this.round(Number(row.scoreGlobalMoyen) || 0),
        evaluationMoyenne: this.round(Number(row.evaluationMoyenne) || 0),
        totalAlertes: Number(row.totalAlertes) || 0,
      }));
    } catch (error) {
      this.logger.error(`Erreur grouped stats SatVi ${alias}`, error?.stack);
      throw new InternalServerErrorException(
        'Impossible de calculer les statistiques groupees SatVi.',
      );
    }
  }

  private applyFilters(
    qb: SelectQueryBuilder<SatviQuestionnaire>,
    query: QuerySatviDto,
  ): void {
    if (query.search) {
      qb.andWhere(
        '(q.referenceCode LIKE :search OR q.provinceVisitee LIKE :search OR q.directionMetier LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.referenceCode) {
      qb.andWhere('q.referenceCode LIKE :referenceCode', {
        referenceCode: `%${query.referenceCode}%`,
      });
    }

    if (query.missionId) {
      qb.andWhere('q.missionId = :missionId', { missionId: query.missionId });
    }

    const directionMetier = query.directionMetier ?? query.direction;
    const provinceVisitee = query.provinceVisitee ?? query.province;

    if (directionMetier) {
      qb.andWhere('q.directionMetier LIKE :directionMetier', {
        directionMetier: `%${directionMetier}%`,
      });
    }

    if (provinceVisitee) {
      qb.andWhere('q.provinceVisitee LIKE :provinceVisitee', {
        provinceVisitee: `%${provinceVisitee}%`,
      });
    }

    if (query.typeMission) {
      qb.andWhere('q.typeMission = :typeMission', {
        typeMission: query.typeMission,
      });
    }

    if (query.status) {
      qb.andWhere('q.status = :status', { status: query.status });
    }

    if (query.dateDebut) {
      qb.andWhere('q.periodeDu >= :dateDebut', { dateDebut: query.dateDebut });
    }

    if (query.dateFin) {
      qb.andWhere('q.periodeAu <= :dateFin', { dateFin: query.dateFin });
    }

    if (query.scoreMin !== undefined) {
      qb.andWhere('q.scoreGlobal >= :scoreMin', { scoreMin: query.scoreMin });
    }

    if (query.scoreMax !== undefined) {
      qb.andWhere('q.scoreGlobal <= :scoreMax', { scoreMax: query.scoreMax });
    }

    if (query.dysfonctionnementMajeur !== undefined) {
      qb.andWhere('q.dysfonctionnementMajeur = :dysfonctionnementMajeur', {
        dysfonctionnementMajeur: query.dysfonctionnementMajeur,
      });
    }
  }

  private applyMissionFilters(
    qb: SelectQueryBuilder<SatviMission>,
    query: QuerySatviMissionDto,
  ): void {
    if (query.search) {
      qb.andWhere(
        '(mission.titre LIKE :search OR mission.referenceCode LIKE :search OR mission.province LIKE :search OR mission.coordinationNom LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.province) {
      qb.andWhere('mission.province LIKE :province', {
        province: `%${query.province}%`,
      });
    }

    if (query.coordinationId) {
      qb.andWhere('mission.coordinationId = :coordinationId', {
        coordinationId: query.coordinationId,
      });
    }

    if (query.typeMission) {
      qb.andWhere('mission.typeMission = :typeMission', {
        typeMission: query.typeMission,
      });
    }

    if (query.status) {
      qb.andWhere('mission.status = :status', { status: query.status });
    }

    if (query.dateDebut) {
      qb.andWhere('mission.dateDebut >= :dateDebut', {
        dateDebut: query.dateDebut,
      });
    }

    if (query.dateFin) {
      qb.andWhere('mission.dateFin <= :dateFin', { dateFin: query.dateFin });
    }

    if (query.avecAlerte !== undefined) {
      const subQuery = this.satviRepository
        .createQueryBuilder('questionnaire')
        .select('questionnaire.missionId')
        .where('questionnaire.dysfonctionnementMajeur = :avecAlerte', {
          avecAlerte: query.avecAlerte,
        });

      qb.andWhere(`mission.id IN (${subQuery.getQuery()})`).setParameters(
        subQuery.getParameters(),
      );
    }
  }

  private computeScores(
    evaluation: Partial<SatviEvaluation>,
    appreciationGlobale: number,
  ): Pick<
    SatviQuestionnaire,
    'evaluationTotal' | 'evaluationCount' | 'evaluationAverage' | 'scoreGlobal'
  > {
    const missing = EVALUATION_KEYS.filter(
      (key) => evaluation[key] === undefined || evaluation[key] === null,
    );

    if (missing.length > 0) {
      throw new BadRequestException(
        `Evaluation SatVi incomplete. Champs manquants: ${missing.join(', ')}.`,
      );
    }

    const values = EVALUATION_KEYS.map((key) => Number(evaluation[key]));
    const invalid = values.some((value) => Number.isNaN(value) || value < 1 || value > 5);

    if (invalid) {
      throw new BadRequestException(
        'Toutes les notes SatVi doivent etre comprises entre 1 et 5.',
      );
    }

    const recommandationScore = Number(
      evaluation.recommandationModeleBonnePratique,
    );
    if (![1, 3, 5].includes(recommandationScore)) {
      throw new BadRequestException(
        'La recommandation du modele de bonne pratique doit valoir 1, 3 ou 5.',
      );
    }

    if (
      Number.isNaN(Number(appreciationGlobale)) ||
      Number(appreciationGlobale) < 1 ||
      Number(appreciationGlobale) > 5
    ) {
      throw new BadRequestException(
        'Le niveau global de satisfaction doit etre compris entre 1 et 5.',
      );
    }

    const evaluationTotal = values.reduce((sum, value) => sum + value, 0);
    const evaluationCount = values.length;
    const evaluationAverage = this.round(evaluationTotal / evaluationCount);
    const scoreGlobal = this.round(
      (evaluationTotal + Number(appreciationGlobale)) / (evaluationCount + 1),
    );

    return {
      evaluationTotal,
      evaluationCount,
      evaluationAverage,
      scoreGlobal,
    };
  }

  private validateDates(periodeDu: string, periodeAu: string): void {
    const start = new Date(periodeDu);
    const end = new Date(periodeAu);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('La periode SatVi contient une date invalide.');
    }

    if (start > end) {
      throw new BadRequestException(
        'La date de debut de periode doit etre inferieure ou egale a la date de fin.',
      );
    }
  }

  private async withMissionIdentification(
    dto: CreateSatviDto,
    missionId: number,
  ): Promise<CreateSatviDto> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
    });

    if (!mission) {
      throw new NotFoundException(`Mission SatVi avec l'ID ${missionId} introuvable.`);
    }

    return {
      ...dto,
      missionId: mission.id,
      directionMetier: dto.directionMetier ?? mission.coordinationNom,
      provinceVisitee: dto.provinceVisitee ?? mission.province,
      periodeDu: dto.periodeDu ?? mission.dateDebut,
      periodeAu: dto.periodeAu ?? mission.dateFin,
      typeMission: dto.typeMission ?? mission.typeMission,
      typeMissionAutre: dto.typeMissionAutre ?? mission.typeMissionAutre,
    };
  }

  private normalizeQuestionnaireFields<
    T extends {
      evaluation?: Partial<SatviEvaluation>;
      appreciationGlobale?: number;
      aspectAccueilAmeliorer?: string;
      difficulteOrganisationnelle?: string;
      ameliorationCollaborationTerrain?: string;
      dysfonctionnementMajeur?: boolean;
    },
  >(dto: T): T {
    const evaluation = dto.evaluation;
    if (!evaluation) {
      return dto;
    }

    return {
      ...dto,
      appreciationGlobale:
        dto.appreciationGlobale ?? evaluation.appreciationGlobale,
      aspectAccueilAmeliorer:
        dto.aspectAccueilAmeliorer ?? evaluation.aspectAccueilAmeliorer,
      difficulteOrganisationnelle:
        dto.difficulteOrganisationnelle ??
        evaluation.difficulteOrganisationnelle,
      ameliorationCollaborationTerrain:
        dto.ameliorationCollaborationTerrain ??
        evaluation.ameliorationCollaborationTerrain,
      dysfonctionnementMajeur:
        dto.dysfonctionnementMajeur ?? evaluation.dysfonctionnementMajeur,
    };
  }

  private async getMissionRow(id: number): Promise<SatviMissionRow> {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      throw new NotFoundException(`Mission SatVi avec l'ID ${id} introuvable.`);
    }

    return this.toMissionRow(mission);
  }

  private async toMissionRow(mission: SatviMission): Promise<SatviMissionRow> {
    const [invites, responseStats] = await Promise.all([
      this.invitationRepository.count({ where: { missionId: mission.id } }),
      this.satviRepository
        .createQueryBuilder('questionnaire')
        .select('COUNT(questionnaire.id)', 'evaluations')
        .addSelect('AVG(questionnaire.scoreGlobal)', 'scoreMoyen')
        .addSelect(
          'SUM(CASE WHEN questionnaire.dysfonctionnementMajeur = true THEN 1 ELSE 0 END)',
          'alertesActives',
        )
        .where('questionnaire.missionId = :missionId', { missionId: mission.id })
        .getRawOne(),
    ]);

    const scoreMoyen = this.round(Number(responseStats?.scoreMoyen) || 0);

    return {
      id: mission.id,
      referenceCode: mission.referenceCode,
      titre: mission.titre,
      description: mission.description,
      province: mission.province,
      coordination: {
        id: mission.coordinationId,
        nom: mission.coordinationNom,
      },
      typeMission: mission.typeMission,
      typeMissionLabel: this.getMissionTypeLabel(mission.typeMission),
      periode: {
        du: mission.dateDebut,
        au: mission.dateFin,
        label: `${mission.dateDebut} -> ${mission.dateFin}`,
        labelFr: `${this.formatDateFr(mission.dateDebut)} -> ${this.formatDateFr(mission.dateFin)}`,
      },
      status: mission.status,
      invites,
      evaluations: Number(responseStats?.evaluations) || 0,
      scoreMoyen,
      scoreLabel: this.getScoreLabel(scoreMoyen),
      alertesActives: Number(responseStats?.alertesActives) || 0,
      createdAt: mission.createdAt,
    };
  }

  private async sendMissionInvitation(
    mission: SatviMission,
    invitation: SatviMissionInvitation,
  ): Promise<SatviMissionInvitation> {
    if (!invitation.email) {
      invitation.status = SatviInvitationStatus.PREPAREE;
      invitation.sendError = 'Email missionnaire indisponible.';
      return await this.invitationRepository.save(invitation);
    }

    const message = [
      `Bonjour ${invitation.nomComplet},`,
      '',
      `Vous etes invite a remplir le questionnaire SatVi pour la mission "${mission.titre}".`,
      `Lien anonyme: ${invitation.invitationLink}`,
      '',
      'Votre reponse sera rattachee a la mission, sans enregistrer votre identite dans le questionnaire.',
    ].join('\n');

    const result = await this.mailService.sendTemplateEmail(
      invitation.email,
      `Questionnaire SatVi - ${mission.titre}`,
      message,
    );

    invitation.status = result?.success === false
      ? SatviInvitationStatus.ECHEC
      : SatviInvitationStatus.ENVOYEE;
    invitation.sentAt = invitation.status === SatviInvitationStatus.ENVOYEE
      ? new Date()
      : null;
    invitation.sendError = result?.success === false ? result.error : null;

    return await this.invitationRepository.save(invitation);
  }

  private buildInvitationLink(token: string, publicBaseUrl?: string): string {
    const baseUrl =
      publicBaseUrl ??
      process.env.SATVI_PUBLIC_BASE_URL ??
      process.env.FRONTEND_URL ??
      'https://cockpit.fonarev.cd/satvi/questionnaire';

    return `${baseUrl.replace(/\/$/, '')}/${token}`;
  }

  private getUserFullName(user: User): string {
    return [user.prenom, user.nom, user.postnom].filter(Boolean).join(' ');
  }

  private async generateMissionReferenceCode(): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const randomPart = randomBytes(3).toString('hex').toUpperCase();
      const referenceCode = `SATVI-M-${datePart}-${randomPart}`;
      const exists = await this.missionRepository.exist({ where: { referenceCode } });

      if (!exists) {
        return referenceCode;
      }
    }

    throw new InternalServerErrorException(
      'Impossible de generer une reference mission SatVi unique.',
    );
  }

  private async generateInvitationToken(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = randomBytes(32).toString('hex');
      const exists = await this.invitationRepository.exist({ where: { token } });

      if (!exists) {
        return token;
      }
    }

    throw new InternalServerErrorException(
      'Impossible de generer un token invitation SatVi unique.',
    );
  }

  private async generateReferenceCode(): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
      const referenceCode = `SATVI-${datePart}-${randomPart}`;
      const exists = await this.satviRepository.exist({ where: { referenceCode } });

      if (!exists) {
        return referenceCode;
      }
    }

    throw new InternalServerErrorException(
      'Impossible de generer une reference SatVi unique.',
    );
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private toDashboardEvaluationRow(
    questionnaire: SatviQuestionnaire,
  ): SatviDashboardEvaluationRow {
    const score = this.round(Number(questionnaire.scoreGlobal) || 0);

    return {
      id: questionnaire.id,
      missionId: questionnaire.missionId,
      referenceCode: questionnaire.referenceCode,
      province: questionnaire.provinceVisitee,
      directionTechnique: questionnaire.directionMetier,
      mission: questionnaire.typeMission,
      periode: {
        du: questionnaire.periodeDu,
        au: questionnaire.periodeAu,
        label: `${questionnaire.periodeDu} -> ${questionnaire.periodeAu}`,
      },
      score,
      scoreLabel: this.getScoreLabel(score),
      statut: questionnaire.dysfonctionnementMajeur ? 'ALERTE' : 'OK',
      status: questionnaire.status,
      dysfonctionnementMajeur: questionnaire.dysfonctionnementMajeur,
      createdAt: questionnaire.createdAt,
    };
  }

  private getScoreLabel(score: number): string {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Bien';
    if (score >= 2.5) return 'Moyen';
    if (score >= 1.5) return 'Insuffisant';
    if (score > 0) return 'Critique';
    return 'Aucune donnee';
  }

  private toEvaluationDetail(
    questionnaire: SatviQuestionnaire,
  ): SatviEvaluationDetail {
    const score = this.round(Number(questionnaire.scoreGlobal) || 0);
    const appreciationScore = this.round(Number(questionnaire.appreciationGlobale) || 0);

    return {
      id: questionnaire.id,
      referenceCode: questionnaire.referenceCode,
      score,
      scoreLabel: this.getScoreLabel(score),
      maxScore: 5,
      scorePercentage: this.toPercentage(score),
      identification: {
        directionTechnique: questionnaire.directionMetier,
        province: questionnaire.provinceVisitee,
        periode: {
          du: questionnaire.periodeDu,
          au: questionnaire.periodeAu,
          label: `${questionnaire.periodeDu} -> ${questionnaire.periodeAu}`,
          labelFr: `${this.formatDateFr(questionnaire.periodeDu)} -> ${this.formatDateFr(questionnaire.periodeAu)}`,
        },
        type: questionnaire.typeMission,
        typeLabel: this.getMissionTypeLabel(questionnaire.typeMission),
      },
      scoresParCritere: this.getCriterionScores(questionnaire.evaluation),
      appreciationDirecte: {
        code: 'appreciation_directe',
        label: 'Score global (appreciation directe)',
        score: appreciationScore,
        maxScore: 5,
        percentage: this.toPercentage(appreciationScore),
        scoreLabel: this.getScoreLabel(appreciationScore),
        color: this.getScoreColor(appreciationScore),
      },
      analyseQualitative: {
        pointsForts: questionnaire.pointsForts,
        aspectAccueilAmeliorer: questionnaire.aspectAccueilAmeliorer,
        difficulteOrganisationnelle: questionnaire.difficulteOrganisationnelle,
        ameliorationCollaborationTerrain:
          questionnaire.ameliorationCollaborationTerrain,
        faiblessesObservees: questionnaire.faiblessesObservees,
        recommandations: questionnaire.recommandations,
      },
      alerte: {
        active: questionnaire.dysfonctionnementMajeur,
        description: questionnaire.descriptionDysfonctionnement,
      },
      status: questionnaire.status,
      soumisLe: questionnaire.submittedAt,
      soumisLeLabel: questionnaire.submittedAt
        ? this.formatDateFr(questionnaire.submittedAt)
        : null,
      evaluation: questionnaire.evaluation,
    };
  }

  private getCriterionScores(evaluation: SatviEvaluation): SatviCriterionScore[] {
    return CRITERIA.map((criterion) => {
      const values = criterion.keys.map((key) => Number(evaluation?.[key]) || 0);
      const score = this.round(
        values.reduce((sum, value) => sum + value, 0) / criterion.keys.length,
      );

      return {
        code: criterion.code,
        label: criterion.label,
        score,
        maxScore: 5,
        percentage: this.toPercentage(score),
        scoreLabel: this.getScoreLabel(score),
        color: this.getScoreColor(score),
      };
    });
  }

  private ratingQuestion(numero: number, key: keyof SatviEvaluation) {
    return {
      key,
      numero,
      type: 'rating',
      min: 1,
      max: 5,
      libelle: this.getQuestionLabel(key),
    };
  }

  private getQuestionLabel(key: keyof SatviEvaluation): string {
    const labels: Record<keyof SatviEvaluation, string> = {
      qualiteAccueil:
        "Comment evaluez-vous la qualite de l'accueil qui vous a ete reserve a votre arrivee ?",
      dispositionsLogistiques:
        'Les dispositions logistiques minimales etaient-elles disponibles a votre arrivee ?',
      disponibiliteEquipeCoordination:
        'Le Coordonnateur Provincial et son equipe etaient-ils disponibles et accessibles durant votre mission ?',
      aspectAccueilAmeliorer:
        "Quel aspect de l'accueil pourrait etre ameliore selon vous ?",
      organisationGenerale:
        'Comment evaluez-vous l organisation generale de la Coordination Provinciale ?',
      missionPrepareeCoordonnee:
        'La mission a-t-elle ete correctement preparee et coordonnee au niveau provincial ?',
      contraintesPrisesEnCharge:
        'Les contraintes rencontrees ont-elles ete correctement prises en charge par la Coordination Provinciale ?',
      difficulteOrganisationnelle:
        'Avez-vous rencontre une difficulte organisationnelle ? Si oui, laquelle ?',
      collaborationAgentsProvinciaux:
        'Comment evaluez-vous la collaboration avec les agents provinciaux ?',
      implicationEquipesLocales:
        'Dans quelle mesure les equipes locales se sont-elles impliquees dans les activites de la mission ?',
      reactiviteEquipesLocales:
        'Comment evaluez-vous la reactivite des equipes locales face a vos besoins ou sollicitations ?',
      ameliorationCollaborationTerrain:
        'Que pourrait-on ameliorer pour renforcer la collaboration sur le terrain ?',
      professionnalismeCoordination:
        'Comment evaluez-vous le niveau de professionnalisme de la Coordination Provinciale ?',
      echangesFluidesRespectueux:
        'Les echanges avec la Coordination Provinciale ont-ils ete fluides et respectueux des circuits de communication ?',
      dysfonctionnementMajeur:
        'Avez-vous observe des difficultes organisationnelles ou des vulnerabilites importantes ?',
      appreciationGlobale:
        'Quel est votre niveau global de satisfaction concernant cette mission ?',
      pertinenceAppuiCoordination:
        "Dans quelle mesure l'appui recu de la Coordination Provinciale a-t-il ete pertinent ?",
      recommandationModeleBonnePratique:
        'Recommanderiez-vous le fonctionnement actuel de cette Coordination Provinciale comme modele de bonne pratique ?',
      recommandationCoordinationBonExemple:
        'Seriez-vous pret(e) a recommander cette Coordination comme un bon exemple de pratique ?',
    };

    return labels[key];
  }

  private getMissionTypeLabel(typeMission: string): string {
    const labels: Record<string, string> = {
      suivi: 'Suivi',
      appui_technique: 'Appui technique',
      controle: 'Controle',
      autre: 'Autre',
    };

    return labels[typeMission] ?? typeMission;
  }

  private getScoreColor(score: number): 'green' | 'blue' | 'yellow' | 'red' {
    if (score >= 4) return 'green';
    if (score >= 3) return 'blue';
    if (score >= 2) return 'yellow';
    return 'red';
  }

  private toPercentage(score: number): number {
    return this.round((score / 5) * 100);
  }

  private formatDateFr(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
}
