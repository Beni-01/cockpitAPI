-- ============================================================================
-- DONNÉES INITIALES - Questions ICM
-- ============================================================================
-- Insérer les questions ICM par défaut dans la base de données
-- À exécuter après le lancement de la migration TypeORM

-- Vider les données existantes (optionnel)
-- DELETE FROM icm_question;
-- ALTER TABLE icm_question AUTO_INCREMENT = 1;

-- ============================================================================
-- INSERTION DES QUESTIONS
-- ============================================================================

INSERT INTO icm_question (label, category, periodicity, expectedProof, `order`, isActive, createdAt, updatedAt) VALUES

-- RH - Questions 1-3
('Entretiens mensuels individuels réalisés', 'RH', 'Mensuel', 'Fiche d\'entretien signée par les agents et le coordonnateur', 1, 1, NOW(), NOW()),

('État de présence du personnel (Retard, Absence, maladie, congé...) – Recrutement & intégration', 'RH', 'Hebdomadaire', 'Fichier signé / Rapport de pointage signé', 2, 1, NOW(), NOW()),

('Réunion d\'équipe tenue (animation d\'équipe)', 'RH', 'Mensuel', 'Compte-rendu signé', 3, 1, NOW(), NOW()),

-- LOGISTIQUE - Questions 4-5
('État des véhicules', 'LOGISTIQUE', 'Mensuel', 'Rapport + photos', 4, 1, NOW(), NOW()),

('Gestion des consommables + stocks', 'LOGISTIQUE', 'Mensuel', 'Fiche stock', 5, 1, NOW(), NOW()),

-- FINANCE - Question 6
('Trésorerie - Justification des dépenses', 'FINANCE', 'Mensuel', 'Factures + bons de caisse', 6, 1, NOW(), NOW()),

-- ADMINISTRATION - Question 7
('Rapports administratifs', 'ADMINISTRATION', 'Mensuel', 'Rapports signés', 7, 1, NOW(), NOW());

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Afficher les questions créées
SELECT 
  id,
  label,
  category,
  periodicity,
  expectedProof,
  `order`,
  isActive,
  createdAt
FROM icm_question
WHERE deletedAt IS NULL
ORDER BY `order` ASC;

-- Compter le nombre de questions
SELECT 
  COUNT(*) as totalQuestions,
  SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeQuestions
FROM icm_question
WHERE deletedAt IS NULL;

-- Compter par catégorie
SELECT 
  category,
  COUNT(*) as count
FROM icm_question
WHERE deletedAt IS NULL
GROUP BY category
ORDER BY category;
