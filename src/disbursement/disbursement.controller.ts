import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { DisbursementService } from './disbursement.service';
import { CreateDisbursementDto, DisbursementFilterDto } from './dto/create-disbursement.dto';
import { UpdateDisbursementDto } from './dto/update-disbursement.dto';
import { Disbursement } from './entities/disbursement.entity';

@Controller('disbursements')
export class DisbursementController {
  constructor(private readonly disbursementService: DisbursementService) {}

  // ==================== CRUD ====================

  /**
   * Créer un décaissement
   */
  @Post()
  create(
    @Body() createDisbursementDto: CreateDisbursementDto,
  ): Promise<Disbursement> {
    return this.disbursementService.create(createDisbursementDto);
  }

  @Post('bulk')
createBulk(
  @Body() createDisbursementDtos: CreateDisbursementDto[],
): Promise<Disbursement[]> {
  return this.disbursementService.createBulk(createDisbursementDtos);
}

  /**
   * Liste paginée avec filtres
   */
  @Get()
  findAll(
    @Query() filterDto: DisbursementFilterDto,
  ) {
    return this.disbursementService.findAll(filterDto);
  }

  /**
   * Récupérer par ID
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Disbursement> {
    return this.disbursementService.findOne(id);
  }

  /**
   * Récupérer par référence
   */
  @Get('reference/:reference')
  findByReference(
    @Param('reference') reference: string,
  ): Promise<Disbursement> {
    return this.disbursementService.findByReference(reference);
  }

  /**
   * Mettre à jour un décaissement
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisbursementDto: UpdateDisbursementDto,
  ): Promise<Disbursement> {
    return this.disbursementService.update(id, updateDisbursementDto);
  }

  /**
   * Supprimer un décaissement
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.disbursementService.remove(id);
  }

  // ==================== STATUT ====================

  /**
   * Marquer comme exécuté
   */
  @Patch(':id/execute')
  markAsExecuted(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Disbursement> {
    return this.disbursementService.markAsExecuted(id);
  }

  /**
   * Mise à jour en masse du statut
   */
  @Patch('bulk/status')
  bulkUpdateStatus(
    @Body()
    payload: {
      ids: number[];
      status: string;
    },
  ): Promise<{ success: number; failed: number }> {
    return this.disbursementService.bulkUpdateStatus(
      payload.ids,
      payload.status,
    );
  }

  // ==================== RECHERCHE ====================

  /**
   * Recherche globale
   */
  @Get('search/query')
  search(
    @Query('q') searchTerm: string,
  ): Promise<Disbursement[]> {
    return this.disbursementService.searchDisbursements(searchTerm);
  }

  /**
   * Décaissements par mois
   */
  @Get('month/:month')
  getByMonth(
    @Param('month') month: string,
  ): Promise<Disbursement[]> {
    return this.disbursementService.getDisbursementsByMonth(month);
  }

  // ==================== STATISTIQUES ====================

  /**
   * Statistiques globales
   */
  @Get('stats/global')
  getStatistics() {
    return this.disbursementService.getStatistics();
  }

  /**
   * Dashboard
   */
  @Get('stats/dashboard')
  getDashboardStats() {
    return this.disbursementService.getDashboardStats();
  }

  /**
   * Rapport de trésorerie
   */
  @Get('reports/treasury')
  getTreasuryReport() {
    return this.disbursementService.getTreasuryReport();
  }
}
