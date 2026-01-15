import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In, DataSource, QueryRunner, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreateDisbursementDto, DisbursementFilterDto, DisbursementPeriodFilterDto, PaginatedResponseDto } from './dto/create-disbursement.dto';
import { UpdateDisbursementDto } from './dto/update-disbursement.dto';

import { Response } from 'express';
import { Disbursement } from './entities/disbursement.entity';

@Injectable()
export class DisbursementService {
  private readonly logger = new Logger(DisbursementService.name);

  // Statuts disponibles basés sur votre fichier Excel
  private readonly STATUS_VALUES = [
    "EXECUTE",
    "NON EXECUTE", 
    "ENCOURS D EXECUTION",
    "COORDONEES BANCAIRES MANQUANTES",
    "EN ATTENTE"
  ];

  
 // Directions disponibles basés sur votre fichier Excel
private readonly DIRECTION_VALUES = [
  "FINANCE",
  "AUDIT INTERNE",
  "ETUDES, ENQUÊTES ET EVALUATIONS",
  "REPARATIONS",
  "AIDE D'ACCÈS À LA JUSTICE ET RECOUVREMENT",
  "ADMINISTRATION ET SERVICES GENERAUX",
  "COMMUNICATION",
  "CELLULE DE PASSATION DES MARCHES",
  "RH ET JURIDIQUE",
  "CELLULE DE MEDIATION",
  "CONSEIL D'ADMINISTRATION",
  "DIRECTION GENERALE",
  "SECRETARIAT DIRECTION GENERALE",
  "ASSISTANT DGA",
  "CELLULE DE SECURITE",
  "CELLULE SUIVI ET EVALUATION DE PERFORMANCE",
  "COORDINATION PROVINCIALE"
];

  // Sources de paiement disponibles
  private readonly PAYMENT_SOURCES = [
    "SOFIBANQUE",
    "RAWBANK",
    "CAISSE",
    "EQUITY",
    "ECOBANK",
    "MASTERCARD",
    "SOFIBANK"
  ];

  constructor(
    @InjectRepository(Disbursement)
    private readonly disbursementRepository: Repository<Disbursement>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== CRUD OPERATIONS ====================

  /**
   * Créer un nouveau décaissement
   */
  async create(createDisbursementDto: CreateDisbursementDto): Promise<Disbursement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Creating disbursement with reference: ${createDisbursementDto.reference}`);

      // Vérifier la référence unique
      const existing = await queryRunner.manager.findOne(Disbursement, {
        where: { reference: createDisbursementDto.reference }
      });

      if (existing) {
        throw new BadRequestException(`La référence ${createDisbursementDto.reference} existe déjà`);
      }

      // Valider la direction
      if (!this.DIRECTION_VALUES.includes(createDisbursementDto.direction.toUpperCase())) {
        throw new BadRequestException(`Direction invalide. Valeurs acceptées: ${this.DIRECTION_VALUES.join(', ')}`);
      }

      // Valider la source de paiement
      if (!this.PAYMENT_SOURCES.includes(createDisbursementDto.paymentSource.toUpperCase())) {
        throw new BadRequestException(`Source de paiement invalide. Valeurs acceptées: ${this.PAYMENT_SOURCES.join(', ')}`);
      }

      // Valider le statut
      if (createDisbursementDto.status && !this.STATUS_VALUES.includes(createDisbursementDto.status.toUpperCase())) {
        throw new BadRequestException(`Statut invalide. Valeurs acceptées: ${this.STATUS_VALUES.join(', ')}`);
      }

      // Extraire le mois et la période
      const documentDate = new Date(createDisbursementDto.documentDate);
      const month = createDisbursementDto.month || this.getMonthName(documentDate);
      const period = createDisbursementDto.period || this.generatePeriod(documentDate);

      // Créer le décaissement
      const disbursement = queryRunner.manager.create(Disbursement, {
        ...createDisbursementDto,
        documentDate,
        month,
        period,
        status: createDisbursementDto.status || "EN ATTENTE",
      });

      const savedDisbursement = await queryRunner.manager.save(disbursement);
      
      await queryRunner.commitTransaction();
      this.logger.log(`Disbursement created successfully with ID: ${savedDisbursement.id}`);
      
      return savedDisbursement;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      this.logger.error(`Failed to create disbursement: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Erreur lors de la création du décaissement');
    } finally {
      await queryRunner.release();
    }
  }


async createBulkOld(
  createDisbursementDtos: CreateDisbursementDto[],
): Promise<Disbursement[]> {
  if (!Array.isArray(createDisbursementDtos) || createDisbursementDtos.length === 0) {
    throw new BadRequestException('Le payload doit être un tableau non vide');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    this.logger.log(`Bulk creating ${createDisbursementDtos.length} disbursements`);

    /* =========================
       Validation métier + mapping
       ========================= */
    const disbursements: Disbursement[] = createDisbursementDtos.map(dto => {
      // Direction
      if (!this.DIRECTION_VALUES.includes(dto.direction.toUpperCase())) {
        throw new BadRequestException(
          `Direction invalide (${dto.reference}). Valeurs acceptées: ${this.DIRECTION_VALUES.join(', ')}`,
        );
      }

      // Source de paiement
      if (!this.PAYMENT_SOURCES.includes(dto.paymentSource.toUpperCase())) {
        throw new BadRequestException(
          `Source de paiement invalide (${dto.reference}). Valeurs acceptées: ${this.PAYMENT_SOURCES.join(', ')}`,
        );
      }

      // Statut
      if (dto.status && !this.STATUS_VALUES.includes(dto.status.toUpperCase())) {
        throw new BadRequestException(
          `Statut invalide (${dto.reference}). Valeurs acceptées: ${this.STATUS_VALUES.join(', ')}`,
        );
      }

      const documentDate = new Date(dto.documentDate);
      const month = dto.month || this.getMonthName(documentDate);
      const period = dto.period || this.generatePeriod(documentDate);

      return queryRunner.manager.create(Disbursement, {
        ...dto,
        documentDate,
        month,
        period,
        status: dto.status || 'EN ATTENTE',
      });
    });

    /* =========================
       Sauvegarde en masse
       ========================= */
    const savedDisbursements = await queryRunner.manager.save(disbursements);

    await queryRunner.commitTransaction();

    this.logger.log(
      `Bulk disbursement created successfully (${savedDisbursements.length})`,
    );

    return savedDisbursements;

  } catch (error) {
    await queryRunner.rollbackTransaction();
    this.logger.error(`Bulk create failed: ${error.message}`, error.stack);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Erreur lors de la création en masse des décaissements',
    );
  } finally {
    await queryRunner.release();
  }
}

async createBulk(
  createDisbursementDtos: CreateDisbursementDto[],
): Promise<Disbursement[]> {
  if (!Array.isArray(createDisbursementDtos) || createDisbursementDtos.length === 0) {
    throw new BadRequestException('Le payload doit être un tableau non vide');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    this.logger.log(
      `Bulk creating ${createDisbursementDtos.length} disbursements`,
    );

    const disbursements: Disbursement[] = createDisbursementDtos.map(dto => {
      const documentDate = new Date(dto.documentDate);

      const month = dto.month ?? this.getMonthName(documentDate);
      const period = dto.period ?? this.generatePeriod(documentDate);

      return queryRunner.manager.create(Disbursement, {
        ...dto,
        documentDate,
        month,
        period,
        status: dto.status ?? 'EN ATTENTE',
      });
    });

    const savedDisbursements = await queryRunner.manager.save(disbursements);

    await queryRunner.commitTransaction();

    this.logger.log(
      `Bulk disbursement created successfully (${savedDisbursements.length})`,
    );

    return savedDisbursements;

  } catch (error) {
    await queryRunner.rollbackTransaction();
    this.logger.error(
      `Bulk create failed: ${error.message}`,
      error.stack,
    );

    throw new InternalServerErrorException(
      'Erreur lors de la création en masse des décaissements',
    );
  } finally {
    await queryRunner.release();
  }
}

  /**
   * Récupérer tous les décaissements avec filtres
   */
  async findAll(filterDto: DisbursementFilterDto): Promise<PaginatedResponseDto<Disbursement>> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        direction, 
        status, 
        paymentSource, 
        beneficiary, 
        month, 
        period,
        startDate,
        endDate,
      } = filterDto;

      // Construire la requête
      const queryBuilder = this.disbursementRepository.createQueryBuilder('disbursement');

      // Appliquer les filtres
      if (direction) {
        queryBuilder.andWhere('disbursement.direction = :direction', { direction });
      }

      if (period) {
        queryBuilder.andWhere('disbursement.period = :period', { period });
      }


      if (status) {
        queryBuilder.andWhere('disbursement.status = :status', { status });
      }

      if (paymentSource) {
        queryBuilder.andWhere('disbursement.paymentSource = :paymentSource', { paymentSource });
      }

      if (beneficiary) {
        queryBuilder.andWhere('disbursement.beneficiary LIKE :beneficiary', { 
          beneficiary: `%${beneficiary}%` 
        });
      }

      if (month) {
        queryBuilder.andWhere('disbursement.month = :month', { month });
      }



      if (startDate && endDate) {
        queryBuilder.andWhere('disbursement.documentDate BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      } else if (startDate) {
        queryBuilder.andWhere('disbursement.documentDate >= :startDate', {
          startDate: new Date(startDate)
        });
      } else if (endDate) {
        queryBuilder.andWhere('disbursement.documentDate <= :endDate', {
          endDate: new Date(endDate)
        });
      }

      // Compter le total
      const total = await queryBuilder.getCount();

      // Appliquer la pagination et le tri
      queryBuilder
        .orderBy('disbursement.documentDate', 'DESC')
        .addOrderBy('disbursement.id', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      // Exécuter la requête
      const data = await queryBuilder.getMany();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      };

    } catch (error) {
      this.logger.error(`Failed to retrieve disbursements: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des décaissements');
    }
  }

  /**
   * Récupérer un décaissement par son ID
   */
  async findOne(id: number): Promise<Disbursement> {
    try {
      const disbursement = await this.disbursementRepository.findOne({
        where: { id }
      });

      if (!disbursement) {
        throw new NotFoundException(`Décaissement avec l'ID ${id} non trouvé`);
      }

      return disbursement;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to retrieve disbursement ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération du décaissement');
    }
  }

  /**
   * Récupérer un décaissement par sa référence
   */
  async findByReference(reference: string): Promise<Disbursement> {
    try {
      const disbursement = await this.disbursementRepository.findOne({
        where: { reference }
      });

      if (!disbursement) {
        throw new NotFoundException(`Décaissement avec la référence ${reference} non trouvé`);
      }

      return disbursement;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to retrieve disbursement by reference ${reference}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération du décaissement');
    }
  }

  /**
   * Mettre à jour un décaissement
   */
  async update(id: number, updateDisbursementDto: UpdateDisbursementDto): Promise<Disbursement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Updating disbursement with ID: ${id}`);

      // Vérifier l'existence du décaissement
      const existingDisbursement = await queryRunner.manager.findOne(Disbursement, {
        where: { id }
      });

      if (!existingDisbursement) {
        throw new NotFoundException(`Décaissement avec l'ID ${id} non trouvé`);
      }

      // Vérifier la référence si elle est modifiée
      if (updateDisbursementDto.reference && updateDisbursementDto.reference !== existingDisbursement.reference) {
        const referenceExists = await queryRunner.manager.findOne(Disbursement, {
          where: { reference: updateDisbursementDto.reference }
        });

        if (referenceExists) {
          throw new BadRequestException(`La référence ${updateDisbursementDto.reference} est déjà utilisée`);
        }
      }

      // Valider la direction si modifiée
      if (updateDisbursementDto.direction && !this.DIRECTION_VALUES.includes(updateDisbursementDto.direction.toUpperCase())) {
        throw new BadRequestException(`Direction invalide. Valeurs acceptées: ${this.DIRECTION_VALUES.join(', ')}`);
      }

      // Valider la source de paiement si modifiée
      if (updateDisbursementDto.paymentSource && !this.PAYMENT_SOURCES.includes(updateDisbursementDto.paymentSource.toUpperCase())) {
        throw new BadRequestException(`Source de paiement invalide. Valeurs acceptées: ${this.PAYMENT_SOURCES.join(', ')}`);
      }

      // Valider le statut si modifié
      if (updateDisbursementDto.status && !this.STATUS_VALUES.includes(updateDisbursementDto.status.toUpperCase())) {
        throw new BadRequestException(`Statut invalide. Valeurs acceptées: ${this.STATUS_VALUES.join(', ')}`);
      }

      // Mettre à jour le mois et la période si la date change
      if (updateDisbursementDto.documentDate) {
        const documentDate = new Date(updateDisbursementDto.documentDate);
        updateDisbursementDto.month = this.getMonthName(documentDate);
        updateDisbursementDto.period = this.generatePeriod(documentDate);
      }

      // Fusionner les modifications
      Object.assign(existingDisbursement, updateDisbursementDto);

      // Sauvegarder les modifications
      const updatedDisbursement = await queryRunner.manager.save(existingDisbursement);
      
      await queryRunner.commitTransaction();
      this.logger.log(`Disbursement updated successfully with ID: ${id}`);
      
      return updatedDisbursement;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to update disbursement ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la mise à jour du décaissement');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Supprimer un décaissement
   */
  async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Deleting disbursement with ID: ${id}`);

      const result = await queryRunner.manager.delete(Disbursement, id);

      if (result.affected === 0) {
        throw new NotFoundException(`Décaissement avec l'ID ${id} non trouvé`);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Disbursement deleted successfully with ID: ${id}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to delete disbursement ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la suppression du décaissement');
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== STATISTIQUES ====================

  /**
   * Obtenir les statistiques globales
   */
  async getStatistics(): Promise<any> {
    try {
      const [
        summaryStats,
        byDirection,
        byPaymentSource,
        byStatus,
        monthlySummary,
        topBeneficiaries
      ] = await Promise.all([
        this.getSummaryStatistics(),
        this.getStatisticsByDirection(),
        this.getStatisticsByPaymentSource(),
        this.getStatisticsByStatus(),
        this.getMonthlySummary(),
        this.getTopBeneficiaries(10),
      ]);

      return {
        summary: summaryStats,
        byDirection,
        byPaymentSource,
        byStatus,
        monthlySummary,
        topBeneficiaries,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`Failed to get statistics: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors du calcul des statistiques');
    }
  }

  /**
   * Statistiques récapitulatives
   */
  private async getSummaryStatistics(): Promise<any> {
    const result = await this.disbursementRepository
      .createQueryBuilder('d')
      .select([
        'COUNT(d.id) as totalCount',
        'SUM(d.usdAmount) as totalUsd',
        'SUM(d.eurAmount) as totalEur',
        'SUM(d.cdfAmount) as totalCdf',
        'SUM(CASE WHEN d.status = "EXECUTE" THEN d.usdAmount ELSE 0 END) as executedUsd',
        'SUM(CASE WHEN d.status = "NON EXECUTE" THEN d.usdAmount ELSE 0 END) as nonExecutedUsd',
        'SUM(CASE WHEN d.status = "ENCOURS D EXECUTION" THEN d.usdAmount ELSE 0 END) as inProgressUsd',
        'AVG(d.usdAmount) as averageAmount',
        'MAX(d.usdAmount) as maxAmount',
        'MIN(d.usdAmount) as minAmount',
      ])
      .getRawOne();

    const totalUsd = parseFloat(result.totalUsd || 0);
    const executedUsd = parseFloat(result.executedUsd || 0);

    return {
      totalCount: parseInt(result.totalCount) || 0,
      totalUsd,
      totalEur: parseFloat(result.totalEur || 0),
      totalCdf: parseFloat(result.totalCdf || 0),
      executedUsd,
      nonExecutedUsd: parseFloat(result.nonExecutedUsd || 0),
      inProgressUsd: parseFloat(result.inProgressUsd || 0),
      executionRate: totalUsd > 0 ? (executedUsd / totalUsd) * 100 : 0,
      averageAmount: parseFloat(result.averageAmount || 0),
      maxAmount: parseFloat(result.maxAmount || 0),
      minAmount: parseFloat(result.minAmount || 0),
    };
  }

  /**
   * Statistiques par direction
   */
  private async getStatisticsByDirection(): Promise<any[]> {
    return this.disbursementRepository
      .createQueryBuilder('d')
      .select([
        'd.direction as direction',
        'COUNT(d.id) as count',
        'SUM(d.usdAmount) as totalUsd',
        'SUM(CASE WHEN d.status = "EXECUTE" THEN d.usdAmount ELSE 0 END) as executedUsd',
        'SUM(CASE WHEN d.status = "NON EXECUTE" THEN d.usdAmount ELSE 0 END) as nonExecutedUsd',
        'AVG(d.usdAmount) as averageAmount',
      ])
      .groupBy('d.direction')
      .orderBy('totalUsd', 'DESC')
      .getRawMany();
  }

  /**
   * Statistiques par source de paiement
   */
  private async getStatisticsByPaymentSource(): Promise<any[]> {
    return this.disbursementRepository
      .createQueryBuilder('d')
      .select([
        'd.paymentSource as paymentSource',
        'COUNT(d.id) as count',
        'SUM(d.usdAmount) as totalUsd',
        'SUM(CASE WHEN d.status = "EXECUTE" THEN d.usdAmount ELSE 0 END) as executedUsd',
        'SUM(CASE WHEN d.status = "NON EXECUTE" THEN d.usdAmount ELSE 0 END) as nonExecutedUsd',
      ])
      .groupBy('d.paymentSource')
      .orderBy('totalUsd', 'DESC')
      .getRawMany();
  }

  /**
   * Statistiques par statut
   */
  private async getStatisticsByStatus(): Promise<any[]> {
    return this.disbursementRepository
      .createQueryBuilder('d')
      .select([
        'd.status as status',
        'COUNT(d.id) as count',
        'SUM(d.usdAmount) as totalUsd',
        'AVG(d.usdAmount) as averageAmount',
      ])
      .groupBy('d.status')
      .orderBy('totalUsd', 'DESC')
      .getRawMany();
  }

  /**
   * Statistiques mensuelles
   */
  private async getMonthlySummary(): Promise<any[]> {
    return this.disbursementRepository
      .createQueryBuilder('d')
      .select([
        'd.month as month',
        'COUNT(d.id) as count',
        'SUM(d.usdAmount) as totalUsd',
        'SUM(CASE WHEN d.status = "EXECUTE" THEN d.usdAmount ELSE 0 END) as executedUsd',
        'SUM(CASE WHEN d.status = "NON EXECUTE" THEN d.usdAmount ELSE 0 END) as nonExecutedUsd',
      ])
      .groupBy('d.month')
      .orderBy('d.month', 'DESC')
      .getRawMany();
  }

  /**
   * Top bénéficiaires
   */
  private async getTopBeneficiaries(limit: number = 10): Promise<any[]> {
    return this.disbursementRepository
      .createQueryBuilder('d')
      .select([
        'd.beneficiary as beneficiary',
        'COUNT(d.id) as count',
        'SUM(d.usdAmount) as totalUsd',
        'AVG(d.usdAmount) as averageAmount',
        'MAX(d.usdAmount) as maxAmount',
      ])
      .groupBy('d.beneficiary')
      .orderBy('totalUsd', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // ==================== RAPPORT DE TRÉSORERIE ====================

  /**
   * Générer le rapport de trésorerie complet comme dans le fichier Excel
   */
  async getTreasuryReport(): Promise<any> {
    try {
      // Récupérer les données des décaissements
      const allDisbursements = await this.disbursementRepository.find({
        order: { documentDate: 'DESC' }
      });

      // Calculer les totaux par source de paiement
      const paymentSourceTotals = this.calculatePaymentSourceTotals(allDisbursements);

      // Calculer les statistiques de trésorerie
      const treasuryStats = await this.calculateTreasuryStatistics(allDisbursements);

      // Récupérer les décaissements non exécutés
      const pendingDisbursements = allDisbursements.filter(
        d => d.status !== "EXECUTE"
      );

      return {
        reportDate: new Date().toISOString(),
        treasurySummary: treasuryStats,
        paymentSourceBreakdown: paymentSourceTotals,
        pendingDisbursements: {
          count: pendingDisbursements.length,
          totalAmount: pendingDisbursements.reduce((sum, d) => sum + (d.usdAmount || 0), 0),
          items: pendingDisbursements.slice(0, 20) // Limiter à 20 items
        },
        executionAnalysis: this.analyzeExecutionStatus(allDisbursements),
        monthlyBreakdown: await this.getMonthlyBreakdown(),
        recommendations: this.generateRecommendations(allDisbursements, treasuryStats),
      };

    } catch (error) {
      this.logger.error(`Failed to generate treasury report: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la génération du rapport de trésorerie');
    }
  }

  private calculatePaymentSourceTotals(disbursements: Disbursement[]): any[] {
    const totals: { [key: string]: { count: number; totalUsd: number; executedUsd: number } } = {};

    disbursements.forEach(d => {
      const source = d.paymentSource;
      if (!totals[source]) {
        totals[source] = { count: 0, totalUsd: 0, executedUsd: 0 };
      }
      
      totals[source].count++;
      totals[source].totalUsd += d.usdAmount || 0;
      
      if (d.status === "EXECUTE") {
        totals[source].executedUsd += d.usdAmount || 0;
      }
    });

    return Object.entries(totals).map(([source, data]) => ({
      paymentSource: source,
      count: data.count,
      totalUsd: data.totalUsd,
      executedUsd: data.executedUsd,
      executionRate: data.totalUsd > 0 ? (data.executedUsd / data.totalUsd) * 100 : 0
    })).sort((a, b) => b.totalUsd - a.totalUsd);
  }

  private async calculateTreasuryStatistics(disbursements: Disbursement[]): Promise<any> {
    const totalUsd = disbursements.reduce((sum, d) => sum + (d.usdAmount || 0), 0);
    const executedUsd = disbursements
      .filter(d => d.status === "EXECUTE")
      .reduce((sum, d) => sum + (d.usdAmount || 0), 0);
    
    const pendingUsd = disbursements
      .filter(d => d.status !== "EXECUTE")
      .reduce((sum, d) => sum + (d.usdAmount || 0), 0);

    // Récupérer le dernier mois pour les statistiques
    const lastMonth = this.getMonthName(new Date());
    const monthlyStats = await this.getMonthlySummary();
    const currentMonthStats = monthlyStats.find(m => m.month === lastMonth);

    return {
      totalDisbursements: disbursements.length,
      totalAmountUsd: totalUsd,
      executedAmountUsd: executedUsd,
      pendingAmountUsd: pendingUsd,
      executionRate: totalUsd > 0 ? (executedUsd / totalUsd) * 100 : 0,
      averageDisbursement: totalUsd / disbursements.length,
      currentMonth: {
        month: lastMonth,
        total: currentMonthStats?.totalUsd || 0,
        executed: currentMonthStats?.executedUsd || 0,
        count: currentMonthStats?.count || 0
      }
    };
  }

  private analyzeExecutionStatus(disbursements: Disbursement[]): any {
    const statusCounts: { [key: string]: { count: number; totalUsd: number } } = {};

    disbursements.forEach(d => {
      const status = d.status;
      if (!statusCounts[status]) {
        statusCounts[status] = { count: 0, totalUsd: 0 };
      }
      
      statusCounts[status].count++;
      statusCounts[status].totalUsd += d.usdAmount || 0;
    });

    return Object.entries(statusCounts).map(([status, data]) => ({
      status,
      count: data.count,
      totalUsd: data.totalUsd,
      percentage: (data.count / disbursements.length) * 100
    }));
  }

  private async getMonthlyBreakdown(): Promise<any[]> {
    return this.disbursementRepository
      .createQueryBuilder('d')
      .select([
        'd.month as month',
        'COUNT(d.id) as count',
        'SUM(d.usdAmount) as totalUsd',
        'SUM(d.eurAmount) as totalEur',
        'SUM(d.cdfAmount) as totalCdf',
        'SUM(CASE WHEN d.status = "EXECUTE" THEN d.usdAmount ELSE 0 END) as executedUsd',
      ])
      .groupBy('d.month')
      .orderBy('d.month', 'DESC')
      .limit(12) // Derniers 12 mois
      .getRawMany();
  }

  private generateRecommendations(disbursements: Disbursement[], treasuryStats: any): string[] {
    const recommendations = [];

    if (treasuryStats.executionRate < 80) {
      recommendations.push("Améliorer le taux d'exécution des paiements qui est actuellement inférieur à 80%");
    }

    const pendingOver30Days = disbursements.filter(d => {
      if (d.status === "EXECUTE") return false;
      const daysDiff = Math.floor((new Date().getTime() - new Date(d.documentDate).getTime()) / (1000 * 3600 * 24));
      return daysDiff > 30;
    });

    if (pendingOver30Days.length > 0) {
      recommendations.push(`Accélérer le traitement de ${pendingOver30Days.length} décaissements en attente depuis plus de 30 jours`);
    }

    const highValuePending = disbursements.filter(d => 
      d.status !== "EXECUTE" && (d.usdAmount || 0) > 10000
    );

    if (highValuePending.length > 0) {
      recommendations.push(`Prioriser l'exécution de ${highValuePending.length} décaissements de haute valeur (> 10,000 USD)`);
    }

    return recommendations;
  }

  // ==================== EXPORT EXCEL ====================

  /**
   * Exporter les décaissements au format Excel
   */

  
  private parseExcelDate(value: any): Date {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'number') {
      // Excel date (nombre de jours depuis 1900)
      return new Date((value - 25569) * 86400 * 1000);
    }
    if (typeof value === 'string') {
      return new Date(value);
    }
    return new Date();
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = parseFloat(value.toString().replace(/,/g, ''));
    return isNaN(num) ? null : num;
  }

  private validateDisbursementData(data: Partial<Disbursement>): void {
    if (!data.direction || !this.DIRECTION_VALUES.includes(data.direction.toUpperCase())) {
      throw new Error(`Direction invalide: ${data.direction}`);
    }
    
    if (!data.reference) {
      throw new Error('La référence est obligatoire');
    }
    
    if (!data.usdAmount || data.usdAmount <= 0) {
      throw new Error('Le montant USD doit être positif');
    }
    
    if (!data.paymentSource) {
      throw new Error('La source de paiement est obligatoire');
    }
  }

  private getMonthName(date: Date): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[date.getMonth()];
  }

  private generatePeriod(date: Date): string {
    const month = this.getMonthName(date);
    const year = date.getFullYear();
    
    // Générer une période comme dans le fichier Excel
    const weekStart = 1; // À adapter selon vos besoins
    const weekEnd = 5;   // À adapter selon vos besoins
    
    return `SEMAINE DU ${weekStart.toString().padStart(2, '0')} au ${weekEnd.toString().padStart(2, '0')} ${month} ${year}`;
  }

  // ==================== DASHBOARD ====================

  /**
   * Obtenir les statistiques pour le tableau de bord
   */
  async getDashboardStats(): Promise<any> {
    try {
      const [
        summaryStats,
        monthlyStats,
        pendingExecutions,
        recentActivities,
        topDirections
      ] = await Promise.all([
        this.getSummaryStatistics(),
        this.getMonthlySummary(),
        this.getPendingExecutions(),
        this.getRecentActivities(10),
        this.getStatisticsByDirection()
      ]);

      return {
        overview: {
          totalDisbursements: summaryStats.totalCount,
          totalAmount: summaryStats.totalUsd,
          executedAmount: summaryStats.executedUsd,
          executionRate: summaryStats.executionRate,
          pendingAmount: summaryStats.nonExecutedUsd + summaryStats.inProgressUsd,
        },
        monthlyTrend: monthlyStats.slice(0, 6).reverse(),
        pendingExecutions: {
          count: pendingExecutions.length,
          totalAmount: pendingExecutions.reduce((sum, d) => sum + (d.usdAmount || 0), 0),
          items: pendingExecutions.slice(0, 5)
        },
        topDirections: topDirections.slice(0, 5),
        recentActivities: recentActivities.slice(0, 10),
        alerts: await this.generateDashboardAlerts(summaryStats, pendingExecutions),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard stats: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des statistiques du tableau de bord');
    }
  }

  /**
   * Récupérer les décaissements en attente
   */
  private async getPendingExecutions(): Promise<Disbursement[]> {
    return this.disbursementRepository.find({
      where: {
        status: In(["NON EXECUTE", "ENCOURS D EXECUTION", "EN ATTENTE"])
      },
      order: {
        documentDate: 'ASC'
      },
      take: 50
    });
  }

  /**
   * Récupérer les activités récentes
   */
  private async getRecentActivities(limit: number): Promise<Disbursement[]> {
    return this.disbursementRepository.find({
      order: {
        createdAt: 'DESC'
      },
      take: limit
    });
  }

  /**
   * Générer des alertes pour le tableau de bord
   */
  private async generateDashboardAlerts(stats: any, pending: Disbursement[]): Promise<any[]> {
    const alerts = [];

    // Alerte pour faible taux d'exécution
    if (stats.executionRate < 70) {
      alerts.push({
        type: 'warning',
        level: 'high',
        message: `Taux d'exécution faible (${stats.executionRate.toFixed(1)}%)`,
        action: 'Améliorer le suivi des décaissements',
        icon: 'warning'
      });
    }

    // Alerte pour décaissements en attente
    const pendingCount = pending.length;
    if (pendingCount > 20) {
      alerts.push({
        type: 'info',
        level: 'medium',
        message: `${pendingCount} décaissements en attente d'exécution`,
        action: 'Traiter les décaissements en attente',
        icon: 'pending'
      });
    }

    // Alerte pour décaissements de montant élevé
    const highValuePending = pending.filter(d => (d.usdAmount || 0) > 5000);
    if (highValuePending.length > 0) {
      alerts.push({
        type: 'critical',
        level: 'high',
        message: `${highValuePending.length} décaissements de haute valeur en attente`,
        action: 'Prioriser les décaissements de montant élevé',
        icon: 'priority_high'
      });
    }

    // Alerte pour décaissements anciens (> 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldPending = pending.filter(d => 
      new Date(d.documentDate) < thirtyDaysAgo
    );
    
    if (oldPending.length > 0) {
      alerts.push({
        type: 'urgent',
        level: 'critical',
        message: `${oldPending.length} décaissements en attente depuis plus de 30 jours`,
        action: 'Traiter les décaissements anciens en priorité',
        icon: 'schedule'
      });
    }

    return alerts;
  }

  /**
   * Rechercher des décaissements
   */
  async searchDisbursements(searchTerm: string): Promise<Disbursement[]> {
    try {
      return await this.disbursementRepository
        .createQueryBuilder('disbursement')
        .where('disbursement.reference LIKE :search', { search: `%${searchTerm}%` })
        .orWhere('disbursement.beneficiary LIKE :search', { search: `%${searchTerm}%` })
        .orWhere('disbursement.expenseNature LIKE :search', { search: `%${searchTerm}%` })
        .orWhere('disbursement.direction LIKE :search', { search: `%${searchTerm}%` })
        .orderBy('disbursement.documentDate', 'DESC')
        .limit(20)
        .getMany();
    } catch (error) {
      this.logger.error(`Failed to search disbursements: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la recherche des décaissements');
    }
  }

  /**
   * Obtenir les décaissements par mois
   */
  async getDisbursementsByMonth(month: string): Promise<Disbursement[]> {
    try {
      return await this.disbursementRepository.find({
        where: { month },
        order: { documentDate: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Failed to get disbursements by month: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Erreur lors de la récupération des décaissements du mois ${month}`);
    }
  }

  /**
   * Marquer un décaissement comme exécuté
   */
  async markAsExecuted(id: number): Promise<Disbursement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const disbursement = await queryRunner.manager.findOne(Disbursement, {
        where: { id }
      });

      if (!disbursement) {
        throw new NotFoundException(`Décaissement avec l'ID ${id} non trouvé`);
      }

      disbursement.status = "EXECUTE";
      
      const updatedDisbursement = await queryRunner.manager.save(disbursement);
      
      await queryRunner.commitTransaction();
      
      this.logger.log(`Disbursement ${id} marked as executed`);
      
      return updatedDisbursement;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to mark disbursement as executed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors du marquage du décaissement comme exécuté');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Mettre à jour le statut de plusieurs décaissements
   */
  async bulkUpdateStatus(ids: number[], status: string): Promise<{ success: number; failed: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!this.STATUS_VALUES.includes(status.toUpperCase())) {
        throw new BadRequestException(`Statut invalide. Valeurs acceptées: ${this.STATUS_VALUES.join(', ')}`);
      }

      let success = 0;
      let failed = 0;

      for (const id of ids) {
        try {
          const disbursement = await queryRunner.manager.findOne(Disbursement, {
            where: { id }
          });

          if (disbursement) {
            disbursement.status = status;
            await queryRunner.manager.save(disbursement);
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          this.logger.warn(`Failed to update disbursement ${id}: ${error.message}`);
        }
      }

      await queryRunner.commitTransaction();
      
      this.logger.log(`Bulk status update completed: ${success} successful, ${failed} failed`);
      
      return { success, failed };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to bulk update status: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la mise à jour en masse des statuts');
    } finally {
      await queryRunner.release();
    }
  }

  async getDisbursementsGroupedByPeriod(
  filterDto: DisbursementPeriodFilterDto,
): Promise<PaginatedResponseDto<any>> {

  const { page = 1, limit = 10, period } = filterDto;

  try {
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('d')
      .orderBy('d.documentDate', 'DESC');

    // 🔎 Filtre par période si fourni
    if (period) {
      queryBuilder.andWhere('d.period = :period', { period });
    }

    // 🔢 Pagination sur les lignes
    const [rows, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 📦 Groupement en mémoire par period
    const grouped = rows.reduce((acc, item) => {
      if (!acc[item.period]) {
        acc[item.period] = {
          period: item.period,
          data: [],
        };
      }
      acc[item.period].data.push(item);
      return acc;
    }, {} as Record<string, { period: string; data: any[] }>);

    return {
      data: Object.values(grouped),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };

  } catch (error) {
    this.logger.error(
      `Failed to group disbursements by period: ${error.message}`,
      error.stack,
    );
    throw new InternalServerErrorException(
      'Erreur lors du regroupement des décaissements par période',
    );
  }
}

async getDisbursementsByPeriodGroups(
  filterDto: DisbursementPeriodFilterDto,
): Promise<any[]> {

  const { period } = filterDto;

  try {
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('d')
      .orderBy('d.documentDate', 'DESC');

    // 🔎 Filtre par période (optionnel)
    if (period) {
      queryBuilder.andWhere('d.period = :period', { period });
    }

    const disbursements = await queryBuilder.getMany();

    const groupedMap = new Map<string, any>();

    for (const d of disbursements) {

      if (!groupedMap.has(d.period)) {
        groupedMap.set(d.period, {
          period: d.period,
          count: 0,

          totalUsd: 0,
          totalEur: 0,
          totalCdf: 0,

          executedUsd: 0,

          pendingUsd: 0,
          pendingEur: 0,
          pendingCdf: 0,

          data: [],
        });
      }

      const group = groupedMap.get(d.period);

      const usd = Number(d.usdAmount || 0);
      const eur = Number(d.eurAmount || 0);
      const cdf = Number(d.cdfAmount || 0);

      group.totalUsd += usd;
      group.totalEur += eur;
      group.totalCdf += cdf;

      if (d.status === 'EXECUTE') {
        group.executedUsd += usd;
      } else {
        group.pendingUsd += usd;
        group.pendingEur += eur;
        group.pendingCdf += cdf;
      }

      group.count++;
      group.data.push(d);
    }

    return Array.from(groupedMap.values());

  } catch (error) {
    this.logger.error(
      `Failed to group disbursements by period: ${error.message}`,
      error.stack,
    );
    throw new InternalServerErrorException(
      'Erreur lors du regroupement des décaissements par période',
    );
  }
}


}