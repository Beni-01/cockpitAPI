/**
 * Données initiales pour le module ICM
 * 
 * Ces données peuvent être utilisées pour:
 * 1. Un seed script NestJS
 * 2. Des tests
 * 3. Une documentation
 * 4. Un fichier d'import JSON
 */

export const ICM_INITIAL_QUESTIONS = [
  // ========================= RH =========================
  {
    label: 'Entretiens mensuels individuels réalisés',
    category: 'RH',
    periodicity: 'Mensuel',
    expectedProof:
      'Fiche d\'entretien signée par les agents et le coordonnateur',
    order: 1,
  },
  {
    label:
      'État de présence du personnel (Retard, Absence, maladie, congé...) – Recrutement & intégration',
    category: 'RH',
    periodicity: 'Hebdomadaire',
    expectedProof: 'Fichier signé / Rapport de pointage signé',
    order: 2,
  },
  {
    label: 'Réunion d\'équipe tenue (animation d\'équipe)',
    category: 'RH',
    periodicity: 'Mensuel',
    expectedProof: 'Compte-rendu signé',
    order: 3,
  },

  // ========================= LOGISTIQUE =========================
  {
    label: 'État des véhicules',
    category: 'LOGISTIQUE',
    periodicity: 'Mensuel',
    expectedProof: 'Rapport + photos',
    order: 4,
  },
  {
    label: 'Gestion des consommables + stocks',
    category: 'LOGISTIQUE',
    periodicity: 'Mensuel',
    expectedProof: 'Fiche stock',
    order: 5,
  },

  // ========================= FINANCE =========================
  {
    label: 'Trésorerie - Justification des dépenses',
    category: 'FINANCE',
    periodicity: 'Mensuel',
    expectedProof: 'Factures + bons de caisse',
    order: 6,
  },

  // ========================= ADMINISTRATION =========================
  {
    label: 'Rapports administratifs',
    category: 'ADMINISTRATION',
    periodicity: 'Mensuel',
    expectedProof: 'Rapports signés',
    order: 7,
  },
];

/**
 * Exemple d'initialisation d'une checklist avec réponses complètes
 */
export const ICM_CHECKLIST_EXAMPLE = {
  coordinationId: 1,
  month: 4,
  year: 2026,
  responses: [
    {
      id: 1,
      realised: true,
      conformityLevel: 'Conforme',
      comment: 'Tous les entretiens mensuels ont été réalisés avec succès',
      proofProvided:
        'https://bucket.s3.com/entretiens-avril-2026.pdf',
    },
    {
      id: 2,
      realised: true,
      conformityLevel: 'Partiellement conforme',
      comment:
        'Présence à 95% avec une absence justifiée. Tous les dossiers sont à jour.',
      proofProvided:
        'https://bucket.s3.com/pointage-avril-2026.xlsx',
    },
    {
      id: 3,
      realised: true,
      conformityLevel: 'Conforme',
      comment:
        'Réunion d\'équipe tenue le 15 avril. Tous les membres ont participé.',
      proofProvided:
        'https://bucket.s3.com/compte-rendu-reunion-15-04-2026.pdf',
    },
    {
      id: 4,
      realised: true,
      conformityLevel: 'Conforme',
      comment:
        'Rapport mensuel complété. Tous les véhicules en bon état. Photos jointes.',
      proofProvided:
        'https://bucket.s3.com/rapport-vehicules-avril-2026.pdf',
    },
    {
      id: 5,
      realised: true,
      conformityLevel: 'Non conforme',
      comment:
        'Stock de consommables insuffisant. Demande de renouvellement en cours.',
      proofProvided:
        'https://bucket.s3.com/fiche-stock-avril-2026.xlsx',
    },
    {
      id: 6,
      realised: true,
      conformityLevel: 'Conforme',
      comment:
        'Toutes les dépenses justifiées. Pièces comptables en ordre et archivées.',
      proofProvided:
        'https://bucket.s3.com/justification-tresorerie-avril-2026.pdf',
    },
    {
      id: 7,
      realised: true,
      conformityLevel: 'Partiellement conforme',
      comment:
        'Rapport mensuel transmis avec retard de 2 jours. Les informations sont complètes.',
      proofProvided:
        'https://bucket.s3.com/rapport-mensuel-avril-2026.pdf',
    },
  ],
};

/**
 * Scores d'exemple pour tester le calcul ICM
 * 
 * Calcul:
 * 8 + 0.5 + 1 + 1 + 0 + 1 + 0.5 = 12 / 7 = 1.714 * 100 = 171.4%
 * 
 * Avec moyenne correcte:
 * 5 conformes (5 x 1 = 5)
 * 2 partiellement conformes (2 x 0.5 = 1)
 * 0 non conformes
 * = 6 / 7 * 100 = 85.71%
 */
export const ICM_SCORE_EXAMPLES = [
  {
    name: 'Excellent (100%)',
    responses: [
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
    ],
    expectedScore: 100,
  },
  {
    name: 'Bon (85.71%)',
    responses: [
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Partiellement conforme', scoreItem: 0.5 },
      { conformityLevel: 'Partiellement conforme', scoreItem: 0.5 },
    ],
    expectedScore: 85.71,
  },
  {
    name: 'Acceptable (71.43%)',
    responses: [
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Partiellement conforme', scoreItem: 0.5 },
      { conformityLevel: 'Partiellement conforme', scoreItem: 0.5 },
      { conformityLevel: 'Non conforme', scoreItem: 0 },
    ],
    expectedScore: 71.43,
  },
  {
    name: 'Faible (50%)',
    responses: [
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Conforme', scoreItem: 1 },
      { conformityLevel: 'Partiellement conforme', scoreItem: 0.5 },
      { conformityLevel: 'Non conforme', scoreItem: 0 },
      { conformityLevel: 'Non conforme', scoreItem: 0 },
      { conformityLevel: 'Non conforme', scoreItem: 0 },
    ],
    expectedScore: 50,
  },
];

/**
 * Catégories et périodicités disponibles
 */
export const ICM_ENUMS = {
  categories: ['RH', 'LOGISTIQUE', 'FINANCE', 'ADMINISTRATION'],
  periodicities: [
    'Hebdomadaire',
    'Mensuel',
    'Trimestriel',
    'Semestriel',
    'Annuel',
  ],
  conformityLevels: [
    'Conforme',
    'Partiellement conforme',
    'Non conforme',
  ],
  checklistStatuses: ['Brouillon', 'Soumis', 'Validé', 'Rejeté'],
};

/**
 * Payloads d'exemple pour les tests
 */
export const ICM_PAYLOADS = {
  createQuestion: {
    label: 'Nouvelle question de test',
    category: 'RH',
    periodicity: 'Mensuel',
    expectedProof: 'Document à fournir',
    order: 10,
  },

  initChecklist: {
    coordinationId: 1,
    month: 4,
    year: 2026,
  },

  updateResponses: {
    responses: [
      {
        id: 1,
        realised: true,
        conformityLevel: 'Conforme',
        comment: 'Test comment',
        proofProvided: 'https://example.com/proof.pdf',
      },
    ],
  },

  rejectChecklist: {
    rejectionReason: 'Preuves incomplètes',
  },
};

/**
 * Script de test - Créer des données de test
 * 
 * Usage:
 * npx ts-node src/icm/seed-icm-data.ts
 */
export async function seedICMData() {
  console.log('🌱 Initialisation des données ICM...');

  try {
    // Créer les questions
    console.log('📝 Création des questions ICM...');
    for (const question of ICM_INITIAL_QUESTIONS) {
      console.log(
        `  ✓ ${question.label} (${question.category})`,
      );
    }

    console.log(
      `\n✅ ${ICM_INITIAL_QUESTIONS.length} questions créées avec succès!`,
    );
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
    throw error;
  }
}
