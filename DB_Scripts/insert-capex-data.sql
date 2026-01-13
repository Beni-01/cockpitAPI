-- ============================================================================
-- Script to Insert Capex Department, Activity, Sous Activity, Tache and Budget
-- Created: January 13, 2026
-- ============================================================================
-- Based on data:
-- Capex | Capex | 17,565,280 | 551,635.00 | 14,696,580.50
-- ============================================================================

-- Disable foreign key checks for the duration of the script
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
START TRANSACTION;

-- ============================================================================
-- 1. INSERT DEPARTMENT (Capex)
-- ============================================================================
-- Insert the Capex department with code 'CX'
-- Check if department already exists before inserting
INSERT INTO `department` (`name`, `code`)
SELECT 'Capex', 'CX'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `department` WHERE `code` = 'CX'
);

-- Get the department ID for further references
SET @department_id = (SELECT `id` FROM `department` WHERE `code` = 'CX' LIMIT 1);

-- ============================================================================
-- 2. INSERT BUDGET_ACTIVITY (Capex Activity)
-- ============================================================================
-- Insert the main Capex activity
-- Total Budget: 17,565,280
INSERT INTO `budget_activity` (`name`, `code`, `department_id`)
SELECT 'Capex', '1', @department_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `budget_activity` WHERE `name` = 'Capex' AND `department_id` = @department_id
);

-- Get the activity ID for further references
SET @activity_id = (SELECT `id` FROM `budget_activity` WHERE `name` = 'Capex' AND `department_id` = @department_id LIMIT 1);

-- ============================================================================
-- 3. INSERT BUDGET_SOUS_ACTIVITY (Capex Sous-Activity)
-- ============================================================================
-- Insert the Capex sous-activity
-- Budget: 551,635.00
INSERT INTO `budget_sous_activity` (`name`, `code`, `activity_id`, `department_id`)
SELECT 'Capex', '1', @activity_id, @department_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `budget_sous_activity` 
    WHERE `name` = 'Capex' AND `activity_id` = @activity_id AND `department_id` = @department_id
);

-- Get the sous-activity ID for further references
SET @sous_activity_id = (SELECT `id` FROM `budget_sous_activity` 
                          WHERE `name` = 'Capex' AND `activity_id` = @activity_id 
                          AND `department_id` = @department_id LIMIT 1);

-- ============================================================================
-- 4. INSERT BUDGET_TACHE (Capex Tache)
-- ============================================================================
-- Insert the Capex tache with cost code
-- Budget: 14,696,580.50
-- Cost Code: CX.1.1.01
INSERT INTO `budget_tache` (`name`, `code`, `cost_code`, `sous_activity_id`, `activity_id`, `department_id`)
SELECT 'Capex', '01', 'CX.1.1.01', @sous_activity_id, @activity_id, @department_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `budget_tache` 
    WHERE `cost_code` = 'CX.1.1.01' AND `sous_activity_id` = @sous_activity_id
);

-- Get the tache ID for further references
SET @tache_id = (SELECT `id` FROM `budget_tache` WHERE `cost_code` = 'CX.1.1.01' LIMIT 1);

-- ============================================================================
-- 5. INSERT BUDGET ENTRIES
-- ============================================================================
-- Insert budget entries for each level

-- 5.1 Main Activity Budget (Total: 17,565,280)
-- 5.3 Tache Budget (Total: 14,696,580.50) — only this budget will be inserted (for fiscal year 2026)
INSERT INTO `budget` (
    `department_id`,
    `activity_id`,
    `sous_activity_id`,
    `tache_id`,
    `cost_center`,
    `texte_libelle`,
    `total_budget_usd`,
    `total_units`,
    `cout_unitaire_usd`,
    `created_at`,
    `updated_at`
)
SELECT 
    @department_id,
    @activity_id,
    @sous_activity_id,
    @tache_id,
    'CX.1.1.01',
    'Budget Capex - Tache Level',
    14696580.50,
    NULL,
    NULL,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `budget` WHERE `cost_center` = 'CX.1.1.01'
);

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================
-- Uncomment the queries below to verify the insertion

-- SELECT * FROM `department` WHERE `code` = 'CX';
-- SELECT * FROM `budget_activity` WHERE `department_id` = @department_id;
-- SELECT * FROM `budget_sous_activity` WHERE `activity_id` = @activity_id;
-- SELECT * FROM `budget_tache` WHERE `sous_activity_id` = @sous_activity_id;
-- SELECT * FROM `budget` WHERE `department_id` = @department_id ORDER BY `cost_center`;

-- ============================================================================
-- Summary Query
-- ============================================================================
-- SELECT 
--     d.name AS Department,
--     d.code AS DepartmentCode,
--     ba.name AS Activity,
--     bsa.name AS SousActivity,
--     bt.name AS Tache,
--     bt.cost_code AS CostCode,
--     b.total_budget_usd AS Budget
-- FROM `department` d
-- LEFT JOIN `budget_activity` ba ON d.id = ba.department_id
-- LEFT JOIN `budget_sous_activity` bsa ON ba.id = bsa.activity_id
-- LEFT JOIN `budget_tache` bt ON bsa.id = bt.sous_activity_id
-- LEFT JOIN `budget` b ON bt.id = b.tache_id
-- WHERE d.code = 'CX';

-- ============================================================================
-- COMMIT AND CLEANUP
-- ============================================================================
COMMIT;
SET FOREIGN_KEY_CHECKS = 1;

-- Success message
SELECT 'Capex department, activity, sous-activity, tache, and budget data inserted successfully!' AS Result;
