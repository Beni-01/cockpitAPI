/*
  ============================================================================
  Create View for Valid Budget Records Only
  ============================================================================
  
  This view shows only budget records where:
  - activity_id matches the department (or is NULL)
  - sous_activity_id matches the department and activity (or is NULL)
  
  Use this view in your queries to always get correct data
  
  ============================================================================
*/

-- Drop the view if it exists
DROP VIEW IF EXISTS budget_valid;

-- Create the view
CREATE VIEW budget_valid AS
SELECT 
  b.id,
  b.cost_center,
  b.description_cc,
  b.province_ville,
  b.coordinations_provinciales,
  b.local_etranger,
  b.categorie_grade,
  b.nature_depenses,
  b.account_ohada,
  b.departement,
  b.texte_libelle,
  b.unite_mesure,
  b.cout_unitaire_usd,
  b.jan,
  b.feb,
  b.mar,
  b.apr,
  b.may,
  b.jun,
  b.jul,
  b.aug,
  b.sep,
  b.oct,
  b.nov,
  b.`dec`,
  b.total_units,
  b.total_budget_usd,
  b.department_id,
  b.assigned_department_id,
  b.mapping_cash_flow_id,
  b.activity_id,
  b.sous_activity_id,
  b.tache_id,
  b.created_at,
  b.updated_at,
  b.deleted_at
FROM budget b
LEFT JOIN budget_activity ba ON ba.id = b.activity_id
LEFT JOIN budget_sous_activity bsa ON bsa.id = b.sous_activity_id
WHERE b.deleted_at IS NULL
  AND (
    -- Activity is NULL or matches department
    b.activity_id IS NULL 
    OR (ba.id IS NOT NULL AND ba.department_id = b.department_id)
  )
  AND (
    -- Sous_activity is NULL or matches department and activity
    b.sous_activity_id IS NULL 
    OR (bsa.id IS NOT NULL 
        AND bsa.department_id = b.department_id 
        AND (b.activity_id IS NULL OR bsa.activity_id = b.activity_id))
  );

-- ============================================================================
-- Test the view
-- ============================================================================

-- Count total valid records
SELECT 'Total valid budget records in view' AS info, COUNT(*) AS count
FROM budget_valid;

-- Count by department
SELECT 
  'Valid records by department' AS info,
  v.department_id,
  d.code AS dept_code,
  d.name AS dept_name,
  COUNT(*) AS valid_count
FROM budget_valid v
LEFT JOIN department d ON d.id = v.department_id
GROUP BY v.department_id, d.code, d.name
ORDER BY v.department_id;

-- Show sample records from the view
SELECT 
  'Sample valid records' AS info,
  v.id,
  v.cost_center,
  v.department_id,
  d.code AS dept_code,
  v.activity_id,
  ba.name AS activity_name,
  v.sous_activity_id,
  bsa.name AS sous_activity_name,
  v.total_budget_usd
FROM budget_valid v
LEFT JOIN department d ON d.id = v.department_id
LEFT JOIN budget_activity ba ON ba.id = v.activity_id
LEFT JOIN budget_sous_activity bsa ON bsa.id = v.sous_activity_id
LIMIT 20;

/*
  ============================================================================
  Usage Examples
  ============================================================================
  
  Instead of:
    SELECT * FROM budget WHERE department_id = 4;
  
  Use:
    SELECT * FROM budget_valid WHERE department_id = 4;
  
  ============================================================================
  
  For transactions query:
    SELECT t.*, b.* 
    FROM transaction t
    INNER JOIN budget_valid b ON t.centreId = b.id
    WHERE b.department_id = 4;
  
  ============================================================================
*/
