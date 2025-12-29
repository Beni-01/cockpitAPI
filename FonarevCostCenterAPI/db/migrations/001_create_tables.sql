-- ============================================================================
-- Fonarev Cost Center Database Migration
-- Created: December 27, 2025
-- Description: Creates tables for Cost Center and Budget Details
-- ============================================================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS fonarev_cost_center_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE fonarev_cost_center_db;

-- ============================================================================
-- Table: cost_center
-- Description: Stores cost center hierarchy data from Master Budget Sheet
-- ============================================================================

CREATE TABLE IF NOT EXISTS cost_center (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Data fields from Excel columns
  mapping_cashflow VARCHAR(255) COMMENT 'Mapping CashFlow (Column A)',
  departement_direction VARCHAR(255) COMMENT 'Department/Direction (Column B)',
  activites VARCHAR(255) COMMENT 'Activities (Column C)',
  sous_activites VARCHAR(255) COMMENT 'Sub-Activities (Column D)',
  taches VARCHAR(500) COMMENT 'Tasks (Column E)',
  
  -- Code fields for hierarchical filtering
  code_departement VARCHAR(50) COMMENT 'Department Code (Column F)',
  code_activite VARCHAR(50) COMMENT 'Activity Code (Column G)',
  code_sous_activite VARCHAR(50) COMMENT 'Sub-Activity Code (Column H)',
  code_tache VARCHAR(50) COMMENT 'Task Code (Column I)',
  cost_code VARCHAR(100) UNIQUE COMMENT 'Cost Center Code (Column J) - Format: XX.X.X.XX',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_dept_code (code_departement),
  INDEX idx_activity_code (code_activite),
  INDEX idx_sub_activity_code (code_sous_activite),
  INDEX idx_task_code (code_tache),
  INDEX idx_cost_code (cost_code),
  INDEX idx_dept_name (departement_direction)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Cost Center hierarchy data from Master Budget Sheet';

-- ============================================================================
-- Table: budget_details
-- Description: Stores detailed budget information for each cost center
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Foreign key to cost_center
  cost_center_code VARCHAR(100) NOT NULL COMMENT 'Links to cost_center.cost_code',
  
  -- Task information
  task_name VARCHAR(500) COMMENT 'Task name/description',
  budget_year INT DEFAULT 2026 COMMENT 'Budget year (from Summary Tab)',
  
  -- Budget details from Depart_Budget_Opex_Input tab
  province_ville VARCHAR(255) COMMENT 'Province & Ville',
  coordinations_provinciales VARCHAR(255) COMMENT 'Coordinations Provinciales',
  local_etranger VARCHAR(100) COMMENT 'Local / Etranger',
  categories_grades VARCHAR(255) COMMENT 'Categories / Grades',
  nature_depenses VARCHAR(255) COMMENT 'Nature Depenses',
  texte_libelle TEXT COMMENT 'Texte / Libelle - Description',
  
  -- Measurement units and amounts
  unites_mesure VARCHAR(100) COMMENT 'Unites de Mesure des donnees mensuelles',
  total_unite_mesure DECIMAL(15,2) COMMENT 'Total en Unite de Mesure des donnees mensuelles',
  total_budget_usd DECIMAL(15,2) COMMENT 'Total Budget en USD',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_cost_center (cost_center_code),
  INDEX idx_budget_year (budget_year),
  
  -- Foreign key constraint
  FOREIGN KEY (cost_center_code) 
    REFERENCES cost_center(cost_code) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Detailed budget information for cost centers';

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================

-- Insert sample cost center data
INSERT INTO cost_center (
  mapping_cashflow,
  departement_direction,
  activites,
  sous_activites,
  taches,
  code_departement,
  code_activite,
  code_sous_activite,
  code_tache,
  cost_code
) VALUES
  (
    'Dépenses de personnel',
    'ETUDES',
    'Cartographie',
    'Cartographie détaillée',
    'Cartographie des zones prioritaires',
    'ET',
    '1',
    '1',
    '01',
    'ET.1.1.01'
  ),
  (
    'Dépenses de formation',
    'ETUDES',
    'Cartographie',
    'Cartographie détaillée',
    'Formation du personnel',
    'ET',
    '1',
    '1',
    '02',
    'ET.1.1.02'
  ),
  (
    'Dépenses générales et administratives',
    'DIRECTION GÉNÉRALE',
    'Pilotage et coordination stratégique',
    'Suivi de la mise en œuvre des politiques publiques',
    'Suivi de la mise en œuvre des politiques publiques',
    'DG',
    '1',
    '4',
    '01',
    'DG.1.4.01'
  )
ON DUPLICATE KEY UPDATE
  mapping_cashflow = VALUES(mapping_cashflow),
  departement_direction = VALUES(departement_direction),
  activites = VALUES(activites),
  sous_activites = VALUES(sous_activites),
  taches = VALUES(taches);

-- Insert sample budget details
INSERT INTO budget_details (
  cost_center_code,
  task_name,
  budget_year,
  province_ville,
  coordinations_provinciales,
  local_etranger,
  categories_grades,
  nature_depenses,
  texte_libelle,
  unites_mesure,
  total_unite_mesure,
  total_budget_usd
) VALUES
  (
    'ET.1.1.01',
    'Cartographie des zones prioritaires',
    2026,
    'Kinshasa',
    'Coordination Kinshasa',
    'Local',
    'Grade A',
    'Salaires',
    'Cartographie des zones prioritaires pour le projet',
    'Jours',
    120.00,
    50000.00
  ),
  (
    'ET.1.1.02',
    'Formation du personnel',
    2026,
    'Kinshasa',
    'Coordination Kinshasa',
    'Local',
    'Grade B',
    'Formation',
    'Formation du personnel sur les outils de cartographie',
    'Sessions',
    10.00,
    15000.00
  ),
  (
    'DG.1.4.01',
    'Suivi de la mise en œuvre des politiques publiques',
    2026,
    'Kinshasa',
    'Direction Générale',
    'Local',
    'Grade A',
    'Coordination',
    'Suivi et coordination des politiques publiques',
    'Mois',
    12.00,
    75000.00
  )
ON DUPLICATE KEY UPDATE
  task_name = VALUES(task_name),
  budget_year = VALUES(budget_year),
  province_ville = VALUES(province_ville),
  total_budget_usd = VALUES(total_budget_usd);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check cost_center table
SELECT 'cost_center' as table_name, COUNT(*) as record_count FROM cost_center;

-- Check budget_details table
SELECT 'budget_details' as table_name, COUNT(*) as record_count FROM budget_details;

-- Check departments
SELECT DISTINCT code_departement, departement_direction 
FROM cost_center 
WHERE code_departement IS NOT NULL 
ORDER BY departement_direction;

-- Check total budget
SELECT 
  SUM(total_budget_usd) as total_budget_usd,
  COUNT(*) as total_tasks
FROM budget_details;

-- ============================================================================
-- End of Migration
-- ============================================================================

SELECT '✅ Migration completed successfully!' as status;
