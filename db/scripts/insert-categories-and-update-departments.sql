-- =====================================================
-- MYSQL SCRIPT : Insert Categories & Update Departments
-- =====================================================

-- 1. Ensure UNIQUE constraint on category name (run once)
ALTER TABLE category
ADD UNIQUE KEY uniq_category_name (name);

-- =====================================================
-- 2. Insert Categories (idempotent)
-- =====================================================
INSERT INTO category (name) VALUES ('Operation')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO category (name) VALUES ('Fonctionnement')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO category (name) VALUES ('COMMUNICATION')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO category (name) VALUES ('Capex')
ON DUPLICATE KEY UPDATE name = name;

-- =====================================================
-- 3. Update Departments with Category IDs
-- =====================================================

-- Operation
UPDATE department d
JOIN category c ON c.name = 'Operation'
SET d.categoryId = c.id
WHERE d.name IN (
    'ETUDES',
    'MEDIATION',
    'ACCES A LA JUSTICE',
    'REPARATION',
    'SECURITE',
    'GENOCOST',
    'PLAIDOYER INTERNATIONAL'
);

-- Fonctionnement
UPDATE department d
JOIN category c ON c.name = 'Fonctionnement'
SET d.categoryId = c.id
WHERE d.name IN (
    'DIRECTION GENERALE',
    'CONSEIL D''ADMINISTRATION',
    'DIRECTION FINANCIERE',
    'AUDIT INTERNE',
    'RESSOURCES HUMAINES',
    'JURIDIQUE',
    'SERVICES GENERAUX & ADM',
    'PASSATION DE MARCHE'
);

-- COMMUNICATION
UPDATE department d
JOIN category c ON c.name = 'COMMUNICATION'
SET d.categoryId = c.id
WHERE d.name = 'COMMUNICATION';

-- Capex
UPDATE department d
JOIN category c ON c.name = 'Capex'
SET d.categoryId = c.id
WHERE d.name = 'Capex';

-- =====================================================
-- 4. Verification
-- =====================================================
SELECT 
    d.id,
    d.name AS department_name,
    d.categoryId,
    c.name AS category_name
FROM department d
LEFT JOIN category c ON d.categoryId = c.id
ORDER BY c.name, d.name;
