-- ============================================================================
-- SQL QUERIES - ICM Module
-- ============================================================================
-- Requêtes SQL utiles pour gérer les tables ICM

-- ============================================================================
-- 1. CRÉER L'INDEX UNIQUE (gérée par la migration)
-- ============================================================================
-- Cette requête crée un index unique qui empêche les doublons de checklist
-- pour la même coordination, mois et année

CREATE UNIQUE INDEX IDX_ICM_CHECKLIST_UNIQUE 
ON icm_checklist (coordinationId, month, year) 
WHERE deletedAt IS NULL;


-- ============================================================================
-- 2. VÉRIFIER SI UNE CHECKLIST EXISTE DÉJÀ
-- ============================================================================
-- Avant d'initialiser une nouvelle checklist

SELECT * FROM icm_checklist 
WHERE coordinationId = 1 
AND month = 4 
AND year = 2026 
AND deletedAt IS NULL;


-- ============================================================================
-- 3. LISTER TOUTES LES QUESTIONS ACTIVES
-- ============================================================================
-- Récupère les questions qui seront utilisées pour générer une checklist

SELECT 
  q.id,
  q.label,
  q.category,
  q.periodicity,
  q.expectedProof,
  q.order,
  q.isActive,
  q.createdAt,
  q.updatedAt
FROM icm_question q
WHERE q.isActive = 1 
AND q.deletedAt IS NULL
ORDER BY q.order ASC;


-- ============================================================================
-- 4. LISTER TOUTES LES CHECKLISTS AVEC LEURS SCORES
-- ============================================================================
-- Affiche les checklists avec détails

SELECT 
  c.id,
  c.coordinationId,
  c.month,
  c.year,
  c.status,
  c.scoreICM,
  c.createdBy,
  c.submittedAt,
  c.validatedBy,
  c.validatedAt,
  c.rejectionReason,
  COUNT(r.id) as totalResponses,
  SUM(r.scoreItem) as totalScore,
  c.createdAt,
  c.updatedAt
FROM icm_checklist c
LEFT JOIN icm_checklist_response r ON c.id = r.checklistId
WHERE c.deletedAt IS NULL
GROUP BY c.id
ORDER BY c.createdAt DESC;


-- ============================================================================
-- 5. RÉCUPÉRER UNE CHECKLIST AVEC SES RÉPONSES
-- ============================================================================
-- Affiche une checklist spécifique avec toutes ses réponses

SELECT 
  c.id as checklistId,
  c.coordinationId,
  c.month,
  c.year,
  c.status,
  c.scoreICM,
  r.id as responseId,
  r.questionId,
  q.label as questionLabel,
  q.category,
  q.periodicity,
  q.expectedProof,
  r.realised,
  r.conformityLevel,
  r.comment,
  r.proofProvided,
  r.scoreItem,
  r.createdAt as responseCreatedAt,
  r.updatedAt as responseUpdatedAt
FROM icm_checklist c
LEFT JOIN icm_checklist_response r ON c.id = r.checklistId
LEFT JOIN icm_question q ON r.questionId = q.id
WHERE c.id = 1 AND c.deletedAt IS NULL
ORDER BY q.order ASC;


-- ============================================================================
-- 6. STATISTIQUES ICM PAR COORDINATION
-- ============================================================================
-- Résumé des scores ICM par coordination

SELECT 
  coord.id,
  coord.nom,
  COUNT(DISTINCT c.id) as totalChecklists,
  SUM(CASE WHEN c.status = 'Validé' THEN 1 ELSE 0 END) as validatedChecklists,
  AVG(c.scoreICM) as averageScore,
  MAX(c.scoreICM) as maxScore,
  MIN(c.scoreICM) as minScore
FROM coordination coord
LEFT JOIN icm_checklist c ON coord.id = c.coordinationId AND c.deletedAt IS NULL
WHERE coord.deletedAt IS NULL
GROUP BY coord.id, coord.nom
ORDER BY averageScore DESC;


-- ============================================================================
-- 7. CALCULER LE SCORE ICM POUR UNE CHECKLIST
-- ============================================================================
-- Formule: (Total des scoreItem / nombre de questions) * 100

SELECT 
  c.id,
  c.month,
  c.year,
  COUNT(r.id) as totalQuestions,
  SUM(r.scoreItem) as totalScore,
  ROUND((SUM(r.scoreItem) / COUNT(r.id)) * 100, 2) as calculatedICMScore
FROM icm_checklist c
LEFT JOIN icm_checklist_response r ON c.id = r.checklistId
WHERE c.id = 1 AND c.deletedAt IS NULL
GROUP BY c.id;


-- ============================================================================
-- 8. COMPTER LES RÉPONSES PAR NIVEAU DE CONFORMITÉ
-- ============================================================================
-- Résumé des réponses par conformité

SELECT 
  c.id as checklistId,
  c.month,
  c.year,
  SUM(CASE WHEN r.realised = 1 AND r.conformityLevel = 'Conforme' THEN 1 ELSE 0 END) as conforme,
  SUM(CASE WHEN r.realised = 1 AND r.conformityLevel = 'Partiellement conforme' THEN 1 ELSE 0 END) as partiellementConforme,
  SUM(CASE WHEN r.realised = 1 AND r.conformityLevel = 'Non conforme' THEN 1 ELSE 0 END) as nonConforme,
  SUM(CASE WHEN r.realised = 0 THEN 1 ELSE 0 END) as nonRealisee
FROM icm_checklist c
LEFT JOIN icm_checklist_response r ON c.id = r.checklistId
WHERE c.id = 1 AND c.deletedAt IS NULL
GROUP BY c.id;


-- ============================================================================
-- 9. LISTER LES CHECKLISTS EN ATTENTE DE VALIDATION
-- ============================================================================
-- Checklists soumises qui attendent une validation

SELECT 
  c.id,
  c.coordinationId,
  c.month,
  c.year,
  c.scoreICM,
  c.submittedAt,
  CONCAT(u.prenom, ' ', u.nom) as submittedBy
FROM icm_checklist c
JOIN user u ON c.createdBy = u.id
WHERE c.status = 'Soumis' 
AND c.deletedAt IS NULL
ORDER BY c.submittedAt ASC;


-- ============================================================================
-- 10. AUDIT - CHECKLISTS REJETÉES AVEC MOTIF
-- ============================================================================
-- Historique des rejets

SELECT 
  c.id,
  c.coordinationId,
  c.month,
  c.year,
  c.scoreICM,
  c.rejectionReason,
  CONCAT(u.prenom, ' ', u.nom) as rejectedBy,
  c.validatedAt as rejectedAt
FROM icm_checklist c
JOIN user u ON c.validatedBy = u.id
WHERE c.status = 'Rejeté' 
AND c.deletedAt IS NULL
ORDER BY c.validatedAt DESC;


-- ============================================================================
-- 11. QUESTIONS NON CONFORMES OU PARTIELLES
-- ============================================================================
-- Identifier les problèmes récurrents

SELECT 
  q.id,
  q.label,
  q.category,
  COUNT(r.id) as totalResponses,
  SUM(CASE WHEN r.conformityLevel = 'Conforme' THEN 1 ELSE 0 END) as conforme,
  SUM(CASE WHEN r.conformityLevel = 'Partiellement conforme' THEN 1 ELSE 0 END) as partiellementConforme,
  SUM(CASE WHEN r.conformityLevel = 'Non conforme' THEN 1 ELSE 0 END) as nonConforme,
  ROUND(
    (SUM(CASE WHEN r.conformityLevel = 'Conforme' THEN 1 ELSE 0 END) / COUNT(r.id)) * 100,
    2
  ) as tauxConformite
FROM icm_question q
LEFT JOIN icm_checklist_response r ON q.id = r.questionId
WHERE r.realised = 1 AND r.conformityLevel IS NOT NULL
GROUP BY q.id
ORDER BY tauxConformite ASC;


-- ============================================================================
-- 12. MAINTENANCE - NETTOYER LES ENREGISTREMENTS SUPPRIMÉS
-- ============================================================================
-- Vérifier les soft delete (records avec deletedAt non NULL)

SELECT 
  COUNT(*) as deletedQuestions
FROM icm_question
WHERE deletedAt IS NOT NULL;

SELECT 
  COUNT(*) as deletedChecklists
FROM icm_checklist
WHERE deletedAt IS NOT NULL;


-- ============================================================================
-- 13. RESTAURER UNE CHECKLIST SUPPRIMÉE (Soft Delete Reversal)
-- ============================================================================
-- Restaurer une checklist supprimée par erreur

UPDATE icm_checklist 
SET deletedAt = NULL 
WHERE id = 1 AND deletedAt IS NOT NULL;


-- ============================================================================
-- 14. INDEX POUR OPTIMISER LES REQUÊTES
-- ============================================================================
-- Créer des index supplémentaires pour les performances

-- Index sur le statut
CREATE INDEX idx_icm_checklist_status 
ON icm_checklist (status) 
WHERE deletedAt IS NULL;

-- Index sur la coordination
CREATE INDEX idx_icm_checklist_coordination 
ON icm_checklist (coordinationId) 
WHERE deletedAt IS NULL;

-- Index sur les questions actives
CREATE INDEX idx_icm_question_active 
ON icm_question (isActive) 
WHERE deletedAt IS NULL;

-- Index sur la catégorie des questions
CREATE INDEX idx_icm_question_category 
ON icm_question (category);
