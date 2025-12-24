-- Drop and recreate table with correct column names from Cost Center sheet

DROP TABLE IF EXISTS master_data;

CREATE TABLE master_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mapping_cashflow TEXT COMMENT 'Column A - Mapping CashFlow',
    departement_direction TEXT COMMENT 'Column B - DEPARTEMENT / DIRECTION',
    activites TEXT COMMENT 'Column C - ACTIVITES',
    sous_activites TEXT COMMENT 'Column D - SOUS ACTVITES',
    taches TEXT COMMENT 'Column E - TACHES',
    code_departement VARCHAR(50) COMMENT 'Column F - CODE DEPARTEMENT',
    code_activite VARCHAR(50) COMMENT 'Column G - CODE ACTIVITE',
    code_sous_activite VARCHAR(50) COMMENT 'Column H - CODE SOUS ACTIVITE',
    code_tache VARCHAR(50) COMMENT 'Column I - CODE TACHE',
    cost_code VARCHAR(100) COMMENT 'Column J - COST CODE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_departement (departement_direction(255)),
    INDEX idx_activites (activites(255)),
    INDEX idx_sous_activites (sous_activites(255)),
    INDEX idx_cost_code (cost_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master Budget - Cost Center data';
