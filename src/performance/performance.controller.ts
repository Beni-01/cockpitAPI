import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';

@ApiTags('Suivi des Performances')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('global')
  @ApiOperation({ summary: 'Récupérer les indicateurs de performance globaux (cartes du haut)' })
  @ApiResponse({ status: 200, description: 'Statistiques globales récupérées avec succès.' })
  getGlobalPerformance() {
    return this.performanceService.getGlobalPerformance();
  }

  @Get('coordinations')
  @ApiOperation({ summary: 'Récupérer le classement des performances par coordination' })
  @ApiResponse({ status: 200, description: 'Classement récupéré avec succès.' })
  getCoordinationsPerformance() {
    return this.performanceService.getCoordinationsPerformance();
  }
}
