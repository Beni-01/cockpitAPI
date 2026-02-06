/*
  ============================================================================
  Quick Database Check - Budget Activity Mismatches
  ============================================================================
  This script only CHECKS the database, no modifications
  Safe to run anytime
  ============================================================================
*/

-- ============================================================================
-- MAIN QUERY: Show ALL Invalid/Mismatch Records
-- ============================================================================

SELECT
  b.id AS budget_id,
  b.cost_center,
  
  -- Budget's Department
  b.department_id AS budget_dept_id,
  d.code AS budget_dept_code,
  d.name AS budget_dept_name,
  
  -- Activity Mismatch
  b.activity_id,
  ba.name AS activity_name,
  ba.department_id AS activity_dept_id,
  ba_dept.code AS activity_dept_code,
  CASE 
    WHEN b.activity_id IS NOT NULL AND (ba.id IS NULL OR ba.department_id != b.department_id) THEN '✗ MISMATCH'
    WHEN b.activity_id IS NOT NULL THEN '✓ OK'
    ELSE 'NULL'
  END AS activity_status,
  
  -- Sous Activity Mismatch
  b.sous_activity_id,
  bsa.name AS sous_activity_name,
  bsa.department_id AS sous_activity_dept_id,
  CASE 
    WHEN b.sous_activity_id IS NOT NULL AND (bsa.id IS NULL OR bsa.department_id != b.department_id) THEN '✗ MISMATCH'
    WHEN b.sous_activity_id IS NOT NULL THEN '✓ OK'
    ELSE 'NULL'
  END AS sous_activity_status,
  
  b.total_budget_usd
  
FROM budget b
INNER JOIN department d ON d.id = b.department_id
LEFT JOIN budget_activity ba ON ba.id = b.activity_id
LEFT JOIN department ba_dept ON ba_dept.id = ba.department_id
LEFT JOIN budget_sous_activity bsa ON bsa.id = b.sous_activity_id
WHERE b.department_id IS NOT NULL
  AND (
    -- Invalid activity
    (b.activity_id IS NOT NULL AND (ba.id IS NULL OR ba.department_id != b.department_id))
    OR
    -- Invalid sous_activity
    (b.sous_activity_id IS NOT NULL AND (bsa.id IS NULL OR bsa.department_id != b.department_id))
  )
ORDER BY b.department_id, b.id
LIMIT 100;

-- ============================================================================
-- SUMMARY: Count of Mismatches by Department
-- ============================================================================

SELECT
  b.department_id,
  d.code AS dept_code,
  d.name AS dept_name,
  COUNT(*) AS total_mismatches,
  SUM(CASE WHEN b.activity_id IS NOT NULL AND (ba.id IS NULL OR ba.department_id != b.department_id) THEN 1 ELSE 0 END) AS activity_mismatches,
  SUM(CASE WHEN b.sous_activity_id IS NOT NULL AND (bsa.id IS NULL OR bsa.department_id != b.department_id) THEN 1 ELSE 0 END) AS sous_activity_mismatches
FROM budget b
INNER JOIN department d ON d.id = b.department_id
LEFT JOIN budget_activity ba ON ba.id = b.activity_id
LEFT JOIN budget_sous_activity bsa ON bsa.id = b.sous_activity_id
WHERE b.department_id IS NOT NULL
  AND (
    (b.activity_id IS NOT NULL AND (ba.id IS NULL OR ba.department_id != b.department_id))
    OR
    (b.sous_activity_id IS NOT NULL AND (bsa.id IS NULL OR bsa.department_id != b.department_id))
  )
GROUP BY b.department_id, d.code, d.name
ORDER BY total_mismatches DESC;
