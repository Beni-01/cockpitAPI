import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Tableau de Bord (Tour de Contrôle)')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales (cartes du haut)' })
  getGlobalStats() {
    return this.dashboardService.getGlobalStats();
  }

  @Get('activities')
  @ApiOperation({ summary: 'Aperçu des activités et avancement par coordination' })
  getActivitiesOverview() {
    return this.dashboardService.getActivitiesOverview();
  }

  @Get('livrables')
  @ApiOperation({ summary: 'Aperçu des livrables et derniers soumis' })
  getLivrablesOverview() {
    return this.dashboardService.getLivrablesOverview();
  }

  @Get('finance')
  @ApiOperation({ summary: 'Aperçu financier et consommation budgetaire' })
  getFinanceOverview() {
    return this.dashboardService.getFinanceOverview();
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Alertes et notifications intelligentes' })
  getAlerts() {
    return this.dashboardService.getAlerts();
  }

  @Get('charroi')
  @ApiOperation({ summary: 'Aperçu de la gestion du charroi (véhicules)' })
  getCharroiOverview() {
    return this.dashboardService.getCharroiOverview();
  }

  @Get('projets-copir')
  @ApiOperation({ summary: 'Aperçu des projets COPIR par direction' })
  getProjectCopirOverview() {
    return this.dashboardService.getProjectCopirOverview();
  }

  @Get('risks')
  @ApiOperation({ summary: 'Matrice des risques et activités critiques' })
  getRisks() {
    return this.dashboardService.getRisks();
  }

  @Get('forecasts')
  @ApiOperation({ summary: 'Prévisions budgétaires et taux d\'achèvement projeté' })
  getForecasts() {
    return this.dashboardService.getForecasts();
  }

  @Get('efficiency')
  @ApiOperation({ summary: 'Index d\'efficacité et performance des ressources' })
  getEfficiency() {
    return this.dashboardService.getEfficiency();
  }

  @Get('governance')
  @ApiOperation({ summary: 'Indice de gouvernance et activité d\'audit' })
  getGovernance() {
    return this.dashboardService.getGovernance();
  }

  @Get('live-feed')
  @ApiOperation({ summary: 'Flux d\'activité en direct (chats et mises à jour)' })
  getLiveFeed() {
    return this.dashboardService.getLiveFeed();
  }

  @Get('overview')
  @ApiOperation({ summary: 'Données complètes pour le chargement initial du dashboard stratégique' })
  async getFullOverview() {
    const [stats, activities, livrables, finance, alerts, charroi, projects, risks, forecasts, efficiency, governance, liveFeed] = await Promise.all([
      this.dashboardService.getGlobalStats(),
      this.dashboardService.getActivitiesOverview(),
      this.dashboardService.getLivrablesOverview(),
      this.dashboardService.getFinanceOverview(),
      this.dashboardService.getAlerts(),
      this.dashboardService.getCharroiOverview(),
      this.dashboardService.getProjectCopirOverview(),
      this.dashboardService.getRisks(),
      this.dashboardService.getForecasts(),
      this.dashboardService.getEfficiency(),
      this.dashboardService.getGovernance(),
      this.dashboardService.getLiveFeed(),
    ]);

    return {
      stats,
      activities,
      livrables,
      finance,
      alerts,
      charroi,
      projects,
      risks,
      forecasts,
      efficiency,
      governance,
      liveFeed
    };
  }
}
