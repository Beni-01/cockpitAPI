import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IcmDashboardService } from '../services/icm-dashboard.service';
import {
  IcmDashboardSummaryResponseDto,
  IcmDashboardChecklistsResponseDto,
  IcmDashboardConsolidatedResponseDto,
  PeriodDto,
} from '../dto/icm-dashboard-summary.dto';

@ApiTags('ICM - Dashboard')
@ApiBearerAuth()
@Controller('icm-dashboard')
export class IcmDashboardController {
  constructor(private readonly icmDashboardService: IcmDashboardService) {}

  @Get('summary')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Récupère le résumé du dashboard ICM',
    description:
      'Retourne le score national, les statistiques par statut et les scores détaillés par coordination pour la période sélectionnée',
  })
  @ApiQuery({
    name: 'month',
    description: 'Mois (1-12)',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'year',
    description: 'Année (ex: 2026)',
    required: true,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Résumé du dashboard ICM récupéré avec succès',
    type: IcmDashboardSummaryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres invalides (month et year requis)',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  async getSummary(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ): Promise<IcmDashboardSummaryResponseDto> {
    return await this.icmDashboardService.getSummary(month, year);
  }

  @Get('consolidated')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Récupère le consolidé détaillé des réponses ICM',
    description:
      'Retourne toutes les réponses des checklists validées avec les détails question par question',
  })
  @ApiQuery({
    name: 'month',
    description: 'Mois (1-12)',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'year',
    description: 'Année (ex: 2026)',
    required: true,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Consolidé détaillé récupéré avec succès',
    type: IcmDashboardConsolidatedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres invalides (month et year requis)',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  async getConsolidated(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ): Promise<IcmDashboardConsolidatedResponseDto> {
    return await this.icmDashboardService.getConsolidated(month, year);
  }

  @Get('checklists')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Récupère la liste des checklists',
    description: 'Retourne la liste de toutes les checklists de la période sélectionnée',
  })
  @ApiQuery({
    name: 'month',
    description: 'Mois (1-12)',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'year',
    description: 'Année (ex: 2026)',
    required: true,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des checklists récupérée avec succès',
    type: IcmDashboardChecklistsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres invalides (month et year requis)',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  async getChecklists(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ): Promise<IcmDashboardChecklistsResponseDto> {
    return await this.icmDashboardService.getChecklists(month, year);
  }

  @Get('periods')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Récupère les périodes disponibles avec des données',
    description:
      'Retourne la liste des mois/années pour lesquels des checklists validées existent',
  })
  @ApiResponse({
    status: 200,
    description: 'Périodes disponibles récupérées avec succès',
    type: [PeriodDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  async getAvailablePeriods(): Promise<PeriodDto[]> {
    return await this.icmDashboardService.getAvailablePeriods();
  }
}


