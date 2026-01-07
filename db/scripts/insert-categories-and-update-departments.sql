-- Insert Categories
-- First, insert the categories if they don't exist
INSERT INTO category (name) VALUES ('Operation') ON CONFLICT DO NOTHING;
INSERT INTO category (name) VALUES ('Fonctionnement') ON CONFLICT DO NOTHING;
INSERT INTO category (name) VALUES ('COMMUNICATION') ON CONFLICT DO NOTHING;
INSERT INTO category (name) VALUES ('Capex') ON CONFLICT DO NOTHING;

-- Update Departments with Category IDs
-- Operation Category
UPDATE department 
SET "categoryId" = (SELECT id FROM category WHERE name = 'Operation')
WHERE name IN ('ETUDES', 'MEDIATION', 'ACCES A LA JUSTICE', 'REPARATION', 'SECURITE', 'GENOCOST', 'PLAIDOYER INTERNATIONAL');

-- Fonctionnement Category
UPDATE department 
SET "categoryId" = (SELECT id FROM category WHERE name = 'Fonctionnement')
WHERE name IN ('DIRECTION GENERALE', 'CONSEIL D''ADMINISTRATION', 'DIRECTION FINANCIERE', 'AUDIT INTERNE', 'RESSOURCES HUMAINES', 'JURIDIQUE', 'SERVICES GENERAUX & ADM', 'PASSATION DE MARCHE');

-- COMMUNICATION Category
UPDATE department 
SET "categoryId" = (SELECT id FROM category WHERE name = 'COMMUNICATION')
WHERE name = 'COMMUNICATION';

-- Capex Category
UPDATE department 
SET "categoryId" = (SELECT id FROM category WHERE name = 'Capex')
WHERE name = 'Capex';

-- Verify the updates
SELECT 
    d.id,
    d.name as department_name,
    d."categoryId",
    c.name as category_name
FROM department d
LEFT JOIN category c ON d."categoryId" = c.id
ORDER BY c.name, d.name;
