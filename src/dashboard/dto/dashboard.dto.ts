export class DashboardStatsDto {
  coordinationsActives: number;
  coordinationsTotal: number;
  agentsDeployes: number;
  agentsTotal: number;
  tauxPresence: number;
  presenceTrend: number;
  budgetConsomme: number;
  budgetTotal: number;
  budgetPercentage: number;
}

export class ActivityOverviewDto {
  repartition: {
    terminees: number;
    enCours: number;
    enRetard: number;
    planifiees: number;
    total: number;
  };
  parCoordination: {
    nom: string;
    progress: number;
    enRetard: number;
    terminees: number;
    total: number;
  }[];
}

export class LivrableOverviewDto {
  stats: {
    conformes: number;
    nonConformes: number;
    enAttente: number;
    enRevue: number;
    total: number;
  };
  derniersLivrables: {
    nom: string;
    coordination: string;
    date: string;
    status: string;
  }[];
}

export class FinanceOverviewDto {
  budgetGlobal: number;
  budgetAlloue: number;
  consommé: number;
  restant: number;
  repartitionFonctionnement: {
    label: string;
    montant: number;
  }[];
  consommationParCoordination: {
    nom: string;
    consomme: number;
    alloue: number;
    percentage: number;
    isCritique: boolean;
  }[];
}

export class AlertDto {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  message: string;
  time: string;
}

export class CharroiOverviewDto {
  stats: {
    operationnels: number;
    enPanne: number;
    maintenance: number;
    nonAffectes: number;
    total: number;
  };
  details: {
    label: string;
    count: number;
    total: number;
    percentage: number;
  }[];
  tauxOperationnelGlobal: number;
}

export class ProjectCopirOverviewDto {
  sections: {
    direction: string;
    projets: {
      nom: string;
      status: string;
      progress: number;
      echeance: string;
    }[];
  }[];
}

export class RiskOverviewDto {
  criticalActivities: {
    id: number;
    nom: string;
    coordination: string;
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  globalRiskScore: number; // 0-100
}

export class ForecastDto {
  budgetExhaustionDate: string; // Estimated date
  projectedCompletionRate: number; // % at end of period
  burnRateMonthly: number; // Average monthly spend
}

export class EfficiencyDto {
  topPerformers: { name: string; score: number }[];
  underperformers: { name: string; score: number; bottleneck: string }[];
  avgCostPerActivity: number;
}

export class GovernanceDto {
  reportSubmissionRate: number;
  auditActivityCount: number;
  lastAudits: { action: string; user: string; date: string }[];
}
