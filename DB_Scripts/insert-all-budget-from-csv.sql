-- Generated from CSV: Fonarev_Budget_Direction Financière - Summary (1).csv
-- Date: 2026-02-03
-- Total records: 60 (FI + CX)
-- 
-- Pattern in description_cc: Department _ Activity _ SousActivity _ Tache
-- This script auto-creates activities, sous_activities, and taches if they don't exist

-- Set department ID variables
SET @fi_dept_id = (SELECT id FROM department WHERE code = 'FI' LIMIT 1);
SET @cx_dept_id = (SELECT id FROM department WHERE code = 'CX' LIMIT 1);


-- FI.0.0.01: Renumeration
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Renumeration', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Renumeration' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Renumeration' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Renumeration', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Renumeration' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Renumeration' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Renumeration', 'FI.0.0.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.0.0.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.0.0.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.0.0.01',
    'DIRECTION FINANCIÈRE _ Renumeration _ Renumeration _ Renumeration',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.0.0.01' 
    AND department_id = @dept_id
);

-- FI.1.1.01: Preparation budgétaires
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi budgétaire', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi budgétaire' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi budgétaire' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Session budgétaires', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Session budgétaires' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Session budgétaires' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Preparation budgétaires', 'FI.1.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.1.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.1.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.1.1.01',
    'DIRECTION FINANCIÈRE _ Suivi budgétaire _ Session budgétaires _ Preparation budgétaires',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 152600.00, 0.00, 0.00,
    152600.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.1.1.01' 
    AND department_id = @dept_id
);

-- FI.1.2.01: Acquisition d''outil de suivi budgétaire
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi budgétaire', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi budgétaire' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi budgétaire' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Outils', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Outils' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Outils' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Acquisition d''outil de suivi budgétaire', 'FI.1.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.1.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.1.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.1.2.01',
    'DIRECTION FINANCIÈRE _ Suivi budgétaire _ Outils _ Acquisition d''outil de suivi budgétaire',
    25000.00, 0.00, 25000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    50000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.1.2.01' 
    AND department_id = @dept_id
);

-- FI.2.1.01: Préparation et validation des états financiers
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Reporting financier', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Reporting financier' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Reporting financier' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Cloture des comptes', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Cloture des comptes' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Cloture des comptes' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Préparation et validation des états financiers', 'FI.2.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.2.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.2.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.2.1.01',
    'DIRECTION FINANCIÈRE _ Reporting financier _ Cloture des comptes _ Préparation et validation des états financiers',
    2600.00, 2600.00, 2600.00, 62600.00, 2600.00, 2600.00, 2600.00, 2600.00, 2600.00, 2600.00, 2600.00, 2600.00,
    91200.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.2.1.01' 
    AND department_id = @dept_id
);

-- FI.2.2.01: Inventaires des immobilisations
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Reporting financier', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Reporting financier' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Reporting financier' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Inventaires des immobilisations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Inventaires des immobilisations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Inventaires des immobilisations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Inventaires des immobilisations', 'FI.2.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.2.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.2.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.2.2.01',
    'DIRECTION FINANCIÈRE _ Reporting financier _ Inventaires des immobilisations _ Inventaires des immobilisations',
    27780.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    27780.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.2.2.01' 
    AND department_id = @dept_id
);

-- FI.3.1.01: Fonctionnement courant
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Fonctionnement courant', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Fonctionnement courant' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Fonctionnement courant' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Fonctionnement courant', 'FI.3.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.1.01',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Fonctionnement courant _ Fonctionnement courant',
    105000.00, 105000.00, 105000.00, 105000.00, 105000.00, 105000.00, 105000.00, 105000.00, 105000.00, 105000.00, 105000.00, 105000.00,
    1260000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.1.01' 
    AND department_id = @dept_id
);

-- FI.3.1.02: Location de bureau et Autres
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Fonctionnement courant', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Fonctionnement courant' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Fonctionnement courant' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Location de bureau et Autres', 'FI.3.1.02', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.1.02' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.1.02' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.1.02',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Fonctionnement courant _ Location de bureau et Autres',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.1.02' 
    AND department_id = @dept_id
);

-- FI.3.1.03: Approvisionnement des coordinations
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Fonctionnement courant', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Fonctionnement courant' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Fonctionnement courant' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Approvisionnement des coordinations', 'FI.3.1.03', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.1.03' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.1.03' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.1.03',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Fonctionnement courant _ Approvisionnement des coordinations',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.1.03' 
    AND department_id = @dept_id
);

-- FI.3.2.01: Autres nouvelles garanties
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Autres nouvelles garanties', 'FI.3.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.01',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Autres nouvelles garanties',
    0.00, 0.00, 5000.00, 0.00, 0.00, 5000.00, 0.00, 0.00, 5000.00, 0.00, 5000.00, 0.00,
    20000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.01' 
    AND department_id = @dept_id
);

-- FI.3.2.02: Loyer Kinshasa
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Kinshasa', 'FI.3.2.02', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.02' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.02' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.02',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Kinshasa',
    90000.00, 90000.00, 90000.00, 90000.00, 90000.00, 90000.00, 90000.00, 90000.00, 90000.00, 90000.00, 90000.00, 90000.00,
    1080000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.02' 
    AND department_id = @dept_id
);

-- FI.3.2.03: Loyer Goma
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Goma', 'FI.3.2.03', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.03' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.03' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.03',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Goma',
    5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00,
    60000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.03' 
    AND department_id = @dept_id
);

-- FI.3.2.04: Loyer Bukavu
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Bukavu', 'FI.3.2.04', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.04' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.04' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.04',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Bukavu',
    3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00,
    36000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.04' 
    AND department_id = @dept_id
);

-- FI.3.2.05: Loyer Lubumbashi
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Lubumbashi', 'FI.3.2.05', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.05' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.05' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.05',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Lubumbashi',
    10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00,
    120000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.05' 
    AND department_id = @dept_id
);

-- FI.3.2.06: Loyer Kolwezi
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Kolwezi', 'FI.3.2.06', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.06' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.06' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.06',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Kolwezi',
    9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00,
    108000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.06' 
    AND department_id = @dept_id
);

-- FI.3.2.07: Loyer Bunia
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Bunia', 'FI.3.2.07', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.07' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.07' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.07',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Bunia',
    6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00,
    72000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.07' 
    AND department_id = @dept_id
);

-- FI.3.2.08: Loyer Kasaï
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Kasaï', 'FI.3.2.08', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.08' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.08' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.08',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Kasaï',
    6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00,
    72000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.08' 
    AND department_id = @dept_id
);

-- FI.3.2.09: Loyer Kongo Central
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Kongo Central', 'FI.3.2.09', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.09' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.09' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.09',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Kongo Central',
    6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00,
    72000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.09' 
    AND department_id = @dept_id
);

-- FI.3.2.10: Loyer Tshopo
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Tshopo', 'FI.3.2.10', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.10' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.10' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.10',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Tshopo',
    3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00,
    36000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.10' 
    AND department_id = @dept_id
);

-- FI.3.2.11: Loyer Bandundu
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Location de bureau et Autres', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Location de bureau et Autres' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Loyer Bandundu', 'FI.3.2.11', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.2.11' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.2.11' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.2.11',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Location de bureau et Autres _ Loyer Bandundu',
    3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00,
    36000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.2.11' 
    AND department_id = @dept_id
);

-- FI.3.3.01: Goma
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Goma', 'FI.3.3.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.01',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Goma',
    2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00,
    24000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.01' 
    AND department_id = @dept_id
);

-- FI.3.3.02: Bukavu
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Bukavu', 'FI.3.3.02', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.02' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.02' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.02',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Bukavu',
    2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00, 2000.00,
    24000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.02' 
    AND department_id = @dept_id
);

-- FI.3.3.03: Lubumbashi
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Lubumbashi', 'FI.3.3.03', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.03' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.03' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.03',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Lubumbashi',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.03' 
    AND department_id = @dept_id
);

-- FI.3.3.04: Kolwezi
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Kolwezi', 'FI.3.3.04', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.04' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.04' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.04',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Kolwezi',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.04' 
    AND department_id = @dept_id
);

-- FI.3.3.05: Bunia
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Bunia', 'FI.3.3.05', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.05' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.05' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.05',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Bunia',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.05' 
    AND department_id = @dept_id
);

-- FI.3.3.06: Kasaï
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Kasaï', 'FI.3.3.06', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.06' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.06' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.06',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Kasaï',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.06' 
    AND department_id = @dept_id
);

-- FI.3.3.07: Kongo Central
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Kongo Central', 'FI.3.3.07', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.07' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.07' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.07',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Kongo Central',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.07' 
    AND department_id = @dept_id
);

-- FI.3.3.08: Tshopo
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Tshopo', 'FI.3.3.08', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.08' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.08' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.08',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Tshopo',
    3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00,
    36000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.08' 
    AND department_id = @dept_id
);

-- FI.3.3.09: Bandundu
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Fonctionnement courant', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Fonctionnement courant' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Approvisionnement des coordinations', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Approvisionnement des coordinations' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Bandundu', 'FI.3.3.09', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.3.3.09' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.3.3.09' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.3.3.09',
    'DIRECTION FINANCIÈRE _ Fonctionnement courant _ Approvisionnement des coordinations _ Bandundu',
    3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00, 3000.00,
    36000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.3.3.09' 
    AND department_id = @dept_id
);

-- FI.4.1.01: Organiser l''audit des comptes
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Conformités à la règlementation et normes financières et fiscales', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Conformités à la règlementation et normes financières et fiscales' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Conformités à la règlementation et normes financières et fiscales' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Conformités à la règlementation et normes financières', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Conformités à la règlementation et normes financières' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Conformités à la règlementation et normes financières' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Organiser l''audit des comptes', 'FI.4.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.4.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.4.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.4.1.01',
    'DIRECTION FINANCIÈRE _ Conformités à la règlementation et normes financières et fiscales _ Conformités à la règlementation et normes financières _ Organiser l''audit des comptes',
    145000.00, 85000.00, 25000.00, 25000.00, 85000.00, 25000.00, 25000.00, 25000.00, 25000.00, 25000.00, 25000.00, 25000.00,
    540000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.4.1.01' 
    AND department_id = @dept_id
);

-- FI.4.2.01: Suivi fiscal
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Conformités à la règlementation et normes financières et fiscales', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Conformités à la règlementation et normes financières et fiscales' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Conformités à la règlementation et normes financières et fiscales' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Conformité fiscal', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Conformité fiscal' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Conformité fiscal' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Suivi fiscal', 'FI.4.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.4.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.4.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.4.2.01',
    'DIRECTION FINANCIÈRE _ Conformités à la règlementation et normes financières et fiscales _ Conformité fiscal _ Suivi fiscal',
    662800.00, 262800.00, 462800.00, 262800.00, 262800.00, 262800.00, 262800.00, 262800.00, 262800.00, 262800.00, 262800.00, 262800.00,
    3753600.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.4.2.01' 
    AND department_id = @dept_id
);

-- FI.5.1.01: Formation des équipes _
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Renforcement des capacités', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Renforcement des capacités' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Renforcement des capacités' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Formation des équipes _', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Formation des équipes _' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Formation des équipes _' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Formation des équipes _', 'FI.5.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.5.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.5.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.5.1.01',
    'DIRECTION FINANCIÈRE _ Renforcement des capacités _ Formation des équipes _',
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.5.1.01' 
    AND department_id = @dept_id
);

-- FI.6.1.01: Dépôts des NP
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi des redevances minières', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Mission de service recouvrement_Dépôts NP', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Mission de service recouvrement_Dépôts NP' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Mission de service recouvrement_Dépôts NP' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Dépôts des NP', 'FI.6.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.6.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.6.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.6.1.01',
    'DIRECTION FINANCIÈRE _ Suivi des redevances minières _ Mission de service recouvrement_Dépôts NP _ Dépôts des NP',
    14300.00, 10800.00, 6800.00, 13500.00, 6000.00, 6000.00, 13500.00, 6000.00, 6000.00, 13500.00, 6000.00, 6000.00,
    108400.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.6.1.01' 
    AND department_id = @dept_id
);

-- FI.6.2.01: Supervisions terrains
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi des redevances minières', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Mission de service recouvrement_Supervision', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Mission de service recouvrement_Supervision' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Mission de service recouvrement_Supervision' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Supervisions terrains', 'FI.6.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.6.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.6.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.6.2.01',
    'DIRECTION FINANCIÈRE _ Suivi des redevances minières _ Mission de service recouvrement_Supervision _ Supervisions terrains',
    0.00, 627600.00, 0.00, 0.00, 627600.00, 0.00, 0.00, 627600.00, 0.00, 0.00, 627600.00, 0.00,
    2510400.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.6.2.01' 
    AND department_id = @dept_id
);

-- FI.6.3.01: Réconciliation avec les parties prenantes
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi des redevances minières', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Mission de service recouvrement_Réconciliation', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Mission de service recouvrement_Réconciliation' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Mission de service recouvrement_Réconciliation' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Réconciliation avec les parties prenantes', 'FI.6.3.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.6.3.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.6.3.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.6.3.01',
    'DIRECTION FINANCIÈRE _ Suivi des redevances minières _ Mission de service recouvrement_Réconciliation _ Réconciliation avec les parties prenantes',
    0.00, 0.00, 216900.00, 0.00, 0.00, 216900.00, 0.00, 0.00, 216900.00, 0.00, 0.00, 216900.00,
    867600.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.6.3.01' 
    AND department_id = @dept_id
);

-- FI.6.4.01: Déclenchement procédures de recouvrement forcé
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi des redevances minières', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Recouvrement forcés', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Recouvrement forcés' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Recouvrement forcés' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Déclenchement procédures de recouvrement forcé', 'FI.6.4.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.6.4.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.6.4.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.6.4.01',
    'DIRECTION FINANCIÈRE _ Suivi des redevances minières _ Recouvrement forcés _ Déclenchement procédures de recouvrement forcé',
    30000.00, 30000.00, 30000.00, 30000.00, 30000.00, 30000.00, 30000.00, 30000.00, 30000.00, 30000.00, 30000.00, 30000.00,
    360000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.6.4.01' 
    AND department_id = @dept_id
);

-- FI.6.4.02: Démarche de collaboration avec la DGRAD
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi des redevances minières', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Recouvrement forcés', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Recouvrement forcés' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Recouvrement forcés' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Démarche de collaboration avec la DGRAD', 'FI.6.4.02', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.6.4.02' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.6.4.02' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.6.4.02',
    'DIRECTION FINANCIÈRE _ Suivi des redevances minières _ Recouvrement forcés _ Démarche de collaboration avec la DGRAD',
    10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00, 10000.00,
    120000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.6.4.02' 
    AND department_id = @dept_id
);

-- FI.6.5.01: Participation à la mining Week
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Suivi des redevances minières', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Suivi des redevances minières' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Réseautage', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Réseautage' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Réseautage' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Participation à la mining Week', 'FI.6.5.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.6.5.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.6.5.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.6.5.01',
    'DIRECTION FINANCIÈRE _ Suivi des redevances minières _ Réseautage _ Participation à la mining Week',
    50000.00, 0.00, 0.00, 0.00, 50000.00, 103650.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    203650.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.6.5.01' 
    AND department_id = @dept_id
);

-- FI.7.1.01: Collaboration avec le ministère des finances et l''ARCA
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Activer les autres sources de financements', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Activer les autres sources de financements' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Activer les autres sources de financements' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Activation prime d''assurance', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Activation prime d''assurance' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Activation prime d''assurance' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Collaboration avec le ministère des finances et l''ARCA', 'FI.7.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.7.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.7.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.7.1.01',
    'DIRECTION FINANCIÈRE _ Activer les autres sources de financements _ Activation prime d''assurance _ Collaboration avec le ministère des finances et l''ARCA',
    9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00, 9000.00,
    108000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.7.1.01' 
    AND department_id = @dept_id
);

-- FI.7.2.01: Collaboration avec le ministère de l''environnement
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Activer les autres sources de financements', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Activer les autres sources de financements' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Activer les autres sources de financements' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Activation quote-part crédit carbone', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Activation quote-part crédit carbone' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Activation quote-part crédit carbone' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Collaboration avec le ministère de l''environnement', 'FI.7.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.7.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.7.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.7.2.01',
    'DIRECTION FINANCIÈRE _ Activer les autres sources de financements _ Activation quote-part crédit carbone _ Collaboration avec le ministère de l''environnement',
    21000.00, 21000.00, 21000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00, 5000.00,
    108000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.7.2.01' 
    AND department_id = @dept_id
);

-- FI.8.1.01: Suivi portefeuille des investissements
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Gérer les investissements du fonds', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Gérer les investissements du fonds' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Gérer les investissements du fonds' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Gestion portefeuille investissements', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Gestion portefeuille investissements' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Gestion portefeuille investissements' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Suivi portefeuille des investissements', 'FI.8.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.8.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.8.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.8.1.01',
    'DIRECTION FINANCIÈRE _ Gérer les investissements du fonds _ Gestion portefeuille investissements _ Suivi portefeuille des investissements',
    4180.00, 34180.00, 4180.00, 4180.00, 4180.00, 4180.00, 29180.00, 4180.00, 4180.00, 4180.00, 4180.00, 29180.00,
    130160.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.8.1.01' 
    AND department_id = @dept_id
);

-- FI.8.2.01: Mission de prospection
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Gérer les investissements du fonds', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Gérer les investissements du fonds' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Gérer les investissements du fonds' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'prospection  acquisition  terrains et/ou immeubles à l''interieur du pays', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'prospection  acquisition  terrains et/ou immeubles à l''interieur du pays' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'prospection  acquisition  terrains et/ou immeubles à l''interieur du pays' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Mission de prospection', 'FI.8.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.8.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.8.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.8.2.01',
    'DIRECTION FINANCIÈRE _ Gérer les investissements du fonds _ prospection  acquisition  terrains et/ou immeubles à l''interieur du pays _ Mission de prospection',
    1000.00, 1000.00, 7710.00, 1000.00, 1000.00, 7710.00, 1000.00, 1000.00, 1000.00, 1000.00, 1000.00, 1000.00,
    25420.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.8.2.01' 
    AND department_id = @dept_id
);

-- FI.8.3.01: Acquisition du logiciel spécialisé de modélisation financière
SET @dept_id = @fi_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Gérer les investissements du fonds', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Gérer les investissements du fonds' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Gérer les investissements du fonds' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '_Outils', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '_Outils' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '_Outils' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Acquisition du logiciel spécialisé de modélisation financière', 'FI.8.3.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'FI.8.3.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'FI.8.3.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'FI.8.3.01',
    'DIRECTION FINANCIÈRE _ Gérer les investissements du fonds _ _Outils _ Acquisition du logiciel spécialisé de modélisation financière',
    0.00, 0.00, 30000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    30000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'FI.8.3.01' 
    AND department_id = @dept_id
);

-- CX.3.1.01: Logiciels_Logiciels
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Logiciels', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Logiciels' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Logiciels' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Logiciels_Logiciels', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Logiciels_Logiciels' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Logiciels_Logiciels' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Logiciels_Logiciels', 'CX.3.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.3.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.3.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.3.1.01',
    'FINANCE  _  Logiciels _  Logiciels_Logiciels',
    103000.00, 30000.00, 440500.00, 15000.00, NULL, NULL, 525000.00, NULL, NULL, NULL, 375000.00, NULL,
    1488500.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.3.1.01' 
    AND department_id = @dept_id
);

-- CX.1.1.01: Terrain + Construction
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Terrain + Construction', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Terrain + Construction' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Terrain + Construction' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Terrain + Construction', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Terrain + Construction' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Terrain + Construction' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Terrain + Construction', 'CX.1.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.1.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.1.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.1.1.01',
    'FINANCE  _  Terrain + Construction _Terrain + Construction_Terrain + Construction',
    NULL, 1300000.00, 1500000.00, 388889.00, 388889.00, 388889.00, 388889.00, 388889.00, 388889.00, 388889.00, 388889.00, 388889.00,
    6300000.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.1.1.01' 
    AND department_id = @dept_id
);

-- CX.5.1.01: Constructions administratives_Constructions administratives
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Constructions administratives', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Constructions administratives' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Constructions administratives' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Constructions administratives_Constructions administratives', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Constructions administratives_Constructions administratives' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Constructions administratives_Constructions administratives' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Constructions administratives_Constructions administratives', 'CX.5.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.5.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.5.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.5.1.01',
    'FINANCE  _  Constructions administratives _  Constructions administratives_Constructions administratives',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.5.1.01' 
    AND department_id = @dept_id
);

-- CX.5.1.02: 5.1.02
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT '5.1.02', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = '5.1.02' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = '5.1.02' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '5.1.02', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '5.1.02' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '5.1.02' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT '5.1.02', 'CX.5.1.02', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.5.1.02' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.5.1.02' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.5.1.02',
    'FINANCE  _  Constructions sociales (écoles',
    22200002.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.5.1.02' 
    AND department_id = @dept_id
);

-- CX.5.1.03: Constructions mémorielles et monuments_Constructions mémorielles et monuments
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Constructions mémorielles et monuments', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Constructions mémorielles et monuments' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Constructions mémorielles et monuments' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Constructions mémorielles et monuments_Constructions mémorielles et monuments', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Constructions mémorielles et monuments_Constructions mémorielles et monuments' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Constructions mémorielles et monuments_Constructions mémorielles et monuments' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Constructions mémorielles et monuments_Constructions mémorielles et monuments', 'CX.5.1.03', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.5.1.03' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.5.1.03' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.5.1.03',
    'FINANCE  _  Constructions mémorielles et monuments _  Constructions mémorielles et monuments_Constructions mémorielles et monuments',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.5.1.03' 
    AND department_id = @dept_id
);

-- CX.6.1.01: 6.1.01
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT '6.1.01', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = '6.1.01' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = '6.1.01' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '6.1.01', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '6.1.01' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '6.1.01' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT '6.1.01', 'CX.6.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.6.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.6.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.6.1.01',
    'FINANCE  _  Installations techniques',
    0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.6.1.01' 
    AND department_id = @dept_id
);

-- CX.7.1.01: Matériel de transport_Matériel de transport
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Matériel de transport', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Matériel de transport' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Matériel de transport' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Matériel de transport_Matériel de transport', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Matériel de transport_Matériel de transport' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Matériel de transport_Matériel de transport' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Matériel de transport_Matériel de transport', 'CX.7.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.7.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.7.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.7.1.01',
    'FINANCE  _  Matériel de transport _  Matériel de transport_Matériel de transport',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.7.1.01' 
    AND department_id = @dept_id
);

-- CX.8.1.01: Mobilier et matériel de bureau_Mobilier et matériel de bureau
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Mobilier et matériel de bureau', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Mobilier et matériel de bureau' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Mobilier et matériel de bureau' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Mobilier et matériel de bureau_Mobilier et matériel de bureau', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Mobilier et matériel de bureau_Mobilier et matériel de bureau' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Mobilier et matériel de bureau_Mobilier et matériel de bureau' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Mobilier et matériel de bureau_Mobilier et matériel de bureau', 'CX.8.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.8.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.8.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.8.1.01',
    'FINANCE  _  Mobilier et matériel de bureau _  Mobilier et matériel de bureau_Mobilier et matériel de bureau',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.8.1.01' 
    AND department_id = @dept_id
);

-- CX.4.6.01: Acquisition
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Matériel informatiques', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Matériel informatiques' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Matériel informatiques' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Acquisition', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Acquisition' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Acquisition' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Acquisition', 'CX.4.6.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.4.6.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.4.6.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.4.6.01',
    'FINANCE  _  Matériel informatiques _  Acquisition',
    0.00, 0.00, 1100.00, 4600.00, 25538.00, 1100.00, 1100.00, 25538.00, 1100.00, 1100.00, 25538.00, 1100.00,
    25538.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.4.6.01' 
    AND department_id = @dept_id
);

-- CX.4.7.01: Autres immobilisations corporelles diverses_Autres immobilisations corporelles diverses
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Autres immobilisations corporelles diverses', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Autres immobilisations corporelles diverses' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Autres immobilisations corporelles diverses' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Autres immobilisations corporelles diverses_Autres immobilisations corporelles diverses', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Autres immobilisations corporelles diverses_Autres immobilisations corporelles diverses' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Autres immobilisations corporelles diverses_Autres immobilisations corporelles diverses' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Autres immobilisations corporelles diverses_Autres immobilisations corporelles diverses', 'CX.4.7.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.4.7.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.4.7.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.4.7.01',
    'FINANCE  _  Autres immobilisations corporelles diverses _  Autres immobilisations corporelles diverses_Autres immobilisations corporelles diverses',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.4.7.01' 
    AND department_id = @dept_id
);

-- CX.2.1.01: Matériels et équipements_Matériels et équipements
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Matériels et équipements', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Matériels et équipements' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Matériels et équipements' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Matériels et équipements_Matériels et équipements', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Matériels et équipements_Matériels et équipements' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Matériels et équipements_Matériels et équipements' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Matériels et équipements_Matériels et équipements', 'CX.2.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.2.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.2.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.2.1.01',
    'FINANCE  _  Matériels et équipements _  Matériels et équipements_Matériels et équipements',
    28667.00, 46667.00, 57867.00, 61667.00, 46667.00, 57867.00, 61667.00, 46667.00, 27867.00, 31667.00, 27867.00, 31667.00,
    526800.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.2.1.01' 
    AND department_id = @dept_id
);

-- CX.3.3.01: 3.3.01
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT '3.3.01', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = '3.3.01' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = '3.3.01' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '3.3.01', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '3.3.01' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '3.3.01' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT '3.3.01', 'CX.3.3.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.3.3.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.3.3.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.3.3.01',
    'FINANCE  _  Amélioration du réseau interne (switching',
    0.00, 22500004.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 2845.00, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.3.3.01' 
    AND department_id = @dept_id
);

-- CX.3.4.01: 3.4.01
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT '3.4.01', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = '3.4.01' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = '3.4.01' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '3.4.01', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '3.4.01' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '3.4.01' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT '3.4.01', 'CX.3.4.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.3.4.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.3.4.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.3.4.01',
    'FINANCE  _  Mise en place du stockage centralisé et des sauvegardes cloud-first (NAS',
    0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.3.4.01' 
    AND department_id = @dept_id
);

-- CX.4.1.01: Acquisition des licences logicielles associés._Achat de NAS
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Acquisition des licences logicielles associés.', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Acquisition des licences logicielles associés.' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Acquisition des licences logicielles associés.' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Acquisition des licences logicielles associés._Achat de NAS', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Acquisition des licences logicielles associés._Achat de NAS' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Acquisition des licences logicielles associés._Achat de NAS' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Acquisition des licences logicielles associés._Achat de NAS', 'CX.4.1.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.4.1.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.4.1.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.4.1.01',
    'FINANCE  _  Acquisition des licences logicielles associés. _  Acquisition des licences logicielles associés._Achat de NAS',
    0.00, 0.00, NULL, NULL, 96385.00, NULL, NULL, 96385.00, NULL, NULL, 96385.00, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.4.1.01' 
    AND department_id = @dept_id
);

-- CX.4.2.01: 4.2.01
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT '4.2.01', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = '4.2.01' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = '4.2.01' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '4.2.01', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '4.2.01' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '4.2.01' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT '4.2.01', 'CX.4.2.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.4.2.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.4.2.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.4.2.01',
    'FINANCE  _  Normalisation des postes de travail et équipements (Laptop pour tous les agents',
    22500006.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 73588.00, NULL, NULL, 73588.00,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.4.2.01' 
    AND department_id = @dept_id
);

-- CX.4.3.01: Acquisition et mise en place de l’infrastructure_Acquisition des services d’hébergement (serveurs virtualisés ou physiques
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Mise en place d’un site de secours externalisé pour la continuité des activités.', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Mise en place d’un site de secours externalisé pour la continuité des activités.' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Mise en place d’un site de secours externalisé pour la continuité des activités.' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Acquisition et mise en place de l’infrastructure_Acquisition des services d’hébergement (serveurs virtualisés ou physiques', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Acquisition et mise en place de l’infrastructure_Acquisition des services d’hébergement (serveurs virtualisés ou physiques' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Acquisition et mise en place de l’infrastructure_Acquisition des services d’hébergement (serveurs virtualisés ou physiques' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Acquisition et mise en place de l’infrastructure_Acquisition des services d’hébergement (serveurs virtualisés ou physiques', 'CX.4.3.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.4.3.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.4.3.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.4.3.01',
    'FINANCE  _  Mise en place d’un site de secours externalisé pour la continuité des activités. _  Acquisition et mise en place de l’infrastructure_Acquisition des services d’hébergement (serveurs virtualisés ou physiques',
    0.00, 0.00, NULL, NULL, 73808.00, NULL, NULL, 73808.00, NULL, NULL, 73808.00, NULL,
    73808.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.4.3.01' 
    AND department_id = @dept_id
);

-- CX.4.4.01: Sélection et acquisition des outils_Acquérir les licences logicielles et équipements associés.
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT 'Déploiement d’outils de gestion de la sécurité', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = 'Déploiement d’outils de gestion de la sécurité' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = 'Déploiement d’outils de gestion de la sécurité' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT 'Sélection et acquisition des outils_Acquérir les licences logicielles et équipements associés.', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = 'Sélection et acquisition des outils_Acquérir les licences logicielles et équipements associés.' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = 'Sélection et acquisition des outils_Acquérir les licences logicielles et équipements associés.' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT 'Sélection et acquisition des outils_Acquérir les licences logicielles et équipements associés.', 'CX.4.4.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.4.4.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.4.4.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.4.4.01',
    'FINANCE  _  Déploiement d’outils de gestion de la sécurité _  Sélection et acquisition des outils_Acquérir les licences logicielles et équipements associés.',
    NULL, NULL, 29457.00, NULL, NULL, 29457.00, NULL, NULL, 29457.00, NULL, NULL, 29457.00,
    117828.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.4.4.01' 
    AND department_id = @dept_id
);

-- CX.4.5.01: 4.5.01
SET @dept_id = @cx_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT '4.5.01', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = '4.5.01' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = '4.5.01' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '4.5.01', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '4.5.01' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '4.5.01' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT '4.5.01', 'CX.4.5.01', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = 'CX.4.5.01' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = 'CX.4.5.01' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    'CX.4.5.01',
    'FINANCE  _  Digitalisation des processus internes (Administration',
    0.00, 0.00, 0.00, 0.00, NULL, NULL, 1290625.00, NULL, NULL, 1290625.00, NULL, NULL,
    0.00,
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = 'CX.4.5.01' 
    AND department_id = @dept_id
);
