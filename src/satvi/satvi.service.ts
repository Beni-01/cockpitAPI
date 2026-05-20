import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository } from 'typeorm';
import { CreateSatviDto, QuerySatviDto, SatviSortBy, UpdateSatviDto } from './dto';
import {
  SatviEvaluation,
  SatviQuestionnaire,
  SatviStatus,
} from './entities/satvi-questionnaire.entity';

const EVALUATION_KEYS: Array<keyof SatviEvaluation> = [
  'arriveePreparee',
  'programmeDisponible',
  'activitesBienOrganisees',
  'agentsDisponibles',
  'interlocuteursAccessibles',
  'equipeMobilisee',
  'informationsFiables',
  'documentsComplets',
  'appuiTechniqueUtile',
  'reponseRapideDemandes',
  'difficultesPrisesEnCharge',
  'adaptationContraintes',
  'communicationClaire',
  'feedbackDisponible',
  'suiviPostMissionAssure',
];

const SORT_COLUMNS: Record<SatviSortBy, string> = {
  [SatviSortBy.CREATED_AT]: 'q.createdAt',
  [SatviSortBy.PERIODE_DU]: 'q.periodeDu',
  [SatviSortBy.PERIODE_AU]: 'q.periodeAu',
  [SatviSortBy.SCORE_GLOBAL]: 'q.scoreGlobal',
  [SatviSortBy.EVALUATION_AVERAGE]: 'q.evaluationAverage',
  [SatviSortBy.APPRECIATION_GLOBALE]: 'q.appreciationGlobale',
};

interface SatviCriterionDefinition {
  code: string;
  label: string;
  keys: Array<keyof SatviEvaluation>;
}

const CRITERIA: SatviCriterionDefinition[] = [
  {
    code: 'organisation_preparation',
    label: "Organisation et preparation de l'appui",
    keys: ['arriveePreparee', 'programmeDisponible', 'activitesBienOrganisees'],
  },
  {
    code: 'disponibilite_mobilisation',
    label: 'Disponibilite et mobilisation des equipes provinciales',
    keys: ['agentsDisponibles', 'interlocuteursAccessibles', 'equipeMobilisee'],
  },
  {
    code: 'qualite_appui',
    label: "Qualite de l'appui technique fourni",
    keys: ['informationsFiables', 'documentsComplets', 'appuiTechniqueUtile'],
  },
  {
    code: 'reactivite_resolution',
    label: 'Reactivite et resolution des problemes',
    keys: [
      'reponseRapideDemandes',
      'difficultesPrisesEnCharge',
      'adaptationContraintes',
    ],
  },
  {
    code: 'professionnalisme_collaboration',
    label: 'Professionnalisme et collaboration',
    keys: ['communicationClaire', 'feedbackDisponible', 'suiviPostMissionAssure'],
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

@Injectable()
export class SatviService {
  private readonly logger = new Logger(SatviService.name);

  constructor(
    @InjectRepository(SatviQuestionnaire)
    private readonly satviRepository: Repository<SatviQuestionnaire>,
  ) {}

  async create(dto: CreateSatviDto): Promise<SatviQuestionnaire> {
    try {
      this.validateDates(dto.periodeDu, dto.periodeAu);

      const computed = this.computeScores(dto.evaluation, dto.appreciationGlobale);
      const status = dto.status ?? SatviStatus.SOUMIS;
      const questionnaire = this.satviRepository.create({
        ...dto,
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

      const periodeDu = dto.periodeDu ?? questionnaire.periodeDu;
      const periodeAu = dto.periodeAu ?? questionnaire.periodeAu;
      this.validateDates(periodeDu, periodeAu);

      const evaluation = dto.evaluation
        ? { ...questionnaire.evaluation, ...dto.evaluation }
        : questionnaire.evaluation;
      const appreciationGlobale =
        dto.appreciationGlobale ?? questionnaire.appreciationGlobale;
      const computed = this.computeScores(evaluation, appreciationGlobale);
      const status = dto.status ?? questionnaire.status;

      const updated = this.satviRepository.merge(questionnaire, {
        ...dto,
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
    const [overview, evaluations, parProvince, provinces] = await Promise.all([
      this.getDashboardOverview(query),
      this.getDashboardEvaluations(query),
      this.getDashboardByProvince(query),
      this.getProvinces(query),
    ]);

    return {
      overview,
      evaluations,
      parProvince,
      provinces,
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
    return CRITERIA.map((criterion, index) => ({
      code: `2.${index + 1}`,
      key: criterion.code,
      titre: criterion.label,
      questions: criterion.keys.map((key) => ({
        key,
        libelle: this.getQuestionLabel(key),
      })),
    }));
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

  private getQuestionLabel(key: keyof SatviEvaluation): string {
    const labels: Record<keyof SatviEvaluation, string> = {
      arriveePreparee:
        'La coordination provinciale avait-elle prepare votre arrivee ?',
      programmeDisponible:
        'Un programme ou agenda de travail etait-il disponible ?',
      activitesBienOrganisees:
        'Les activites ont-elles ete bien organisees localement ?',
      agentsDisponibles:
        'Les agents de la coordination etaient-ils disponibles ?',
      interlocuteursAccessibles:
        'Les interlocuteurs cles etaient-ils accessibles ?',
      equipeMobilisee:
        "L'equipe s'est-elle mobilisee pour faciliter la mission ?",
      informationsFiables:
        'Les informations fournies etaient-elles fiables ?',
      documentsComplets:
        'Les donnees et documents etaient-ils complets ?',
      appuiTechniqueUtile:
        "L'appui technique a-t-il ete utile a votre mission ?",
      reponseRapideDemandes:
        'La coordination a-t-elle repondu rapidement a vos demandes ?',
      difficultesPrisesEnCharge:
        'Les difficultes rencontrees ont-elles ete prises en charge ?',
      adaptationContraintes:
        "L'equipe a-t-elle su s'adapter aux contraintes ?",
      communicationClaire:
        'La communication avec la coordination etait-elle claire ?',
      feedbackDisponible:
        'Un retour ou feedback etait-il disponible pendant la mission ?',
      suiviPostMissionAssure:
        'Le suivi post-mission a-t-il ete assure ?',
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
