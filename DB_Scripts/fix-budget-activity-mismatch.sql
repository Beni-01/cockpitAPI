/*
  ============================================================================
  Fix Budget.activity_id and Budget.sous_activity_id to match department_id
  ============================================================================
  
  Problem: Budget records have activity_id and sous_activity_id values that
           don't belong to their department_id
  
  Solution: This script identifies and fixes these mismatches
  
  Tables involved:
    - budget (id, department_id, activity_id, sous_activity_id, ...)
    - budget_activity (id, department_id, name, ...)
    - budget_sous_activity (id, department_id, activity_id, name, ...)
  
  ⚠️⚠️⚠️  IMPORTANT - READ BEFORE RUNNING  ⚠️⚠️⚠️
  
  THIS SCRIPT IS NOW SET TO COMMIT (APPLY CHANGES)!
  
  Before running:
  1. ✓ BACKUP YOUR DATABASE
  2. ✓ Run check-budget-activity-issues.sql first to preview
  3. ✓ Review each query result as it runs
  4. ✓ Validation queries should show 0 invalid rows at the end
  
  What it does:
  - Sets invalid activity_id to NULL
  - Sets invalid sous_activity_id to NULL
  - COMMITS changes automatically
  
  ============================================================================
*/

START TRANSACTION;

/* ============================================================================
   STEP 0: Database Overview
   ============================================================================ */

SELECT 'STEP 0: Current database state' AS step;

SELECT
  COUNT(*) AS total_budget_rows,
  SUM(CASE WHEN department_id IS NULL THEN 1 ELSE 0 END) AS missing_department,
  SUM(CASE WHEN activity_id IS NULL THEN 1 ELSE 0 END) AS missing_activity,
  SUM(CASE WHEN sous_activity_id IS NULL THEN 1 ELSE 0 END) AS missing_sous_activity,
  SUM(CASE WHEN activity_id IS NOT NULL AND department_id IS NOT NULL THEN 1 ELSE 0 END) AS has_activity,
  SUM(CASE WHEN sous_activity_id IS NOT NULL AND department_id IS NOT NULL THEN 1 ELSE 0 END) AS has_sous_activity
FROM budget;

/* ============================================================================
   STEP 1: Detect INVALID ACTIVITY_ID (doesn't match department)
   ============================================================================ */

SELECT 'STEP 1: Detecting invalid activity_id...' AS step;

-- Show all invalid activity references
SELECT
  b.id AS budget_id,
  b.department_id AS budget_dept_id,
  d.code AS budget_dept_code,
  d.name AS budget_dept_name,
  b.activity_id AS invalid_activity_id,
  ba.name AS activity_name,
  ba.department_id AS activity_dept_id,
  da.code AS activity_dept_code,
  da.name AS activity_dept_name,
  b.total_budget_usd
FROM budget b
INNER JOIN department d ON d.id = b.department_id
LEFT JOIN budget_activity ba ON ba.id = b.activity_id
LEFT JOIN department da ON da.id = ba.department_id
WHERE b.department_id IS NOT NULL
  AND b.activity_id IS NOT NULL
  AND (ba.id IS NULL OR ba.department_id != b.department_id)
ORDER BY b.department_id, b.activity_id
LIMIT 50;

-- Count invalid activities
SELECT COUNT(*) AS total_invalid_activity_rows
FROM budget b
LEFT JOIN budget_activity ba 
  ON ba.id = b.activity_id 
  AND ba.department_id = b.department_id
WHERE b.department_id IS NOT NULL
  AND b.activity_id IS NOT NULL
  AND ba.id IS NULL;

/* ============================================================================
   STEP 2: Detect INVALID SOUS_ACTIVITY_ID
   ============================================================================ */

SELECT 'STEP 2: Detecting invalid sous_activity_id...' AS step;

-- Show all invalid sous_activity references
SELECT
  b.id AS budget_id,
  b.department_id,
  d.code AS dept_code,
  b.activity_id,
  ba.name AS activity_name,
  b.sous_activity_id AS invalid_sous_activity_id,
  bsa.name AS sous_activity_name,
  bsa.department_id AS sous_activity_dept_id,
  bsa.activity_id AS sous_activity_activity_id,
  b.total_budget_usd
FROM budget b
INNER JOIN department d ON d.id = b.department_id
LEFT JOIN budget_activity ba ON ba.id = b.activity_id
LEFT JOIN budget_sous_activity bsa ON bsa.id = b.sous_activity_id
WHERE b.department_id IS NOT NULL
  AND b.sous_activity_id IS NOT NULL
  AND (
    bsa.id IS NULL 
    OR bsa.department_id != b.department_id 
    OR (b.activity_id IS NOT NULL AND bsa.activity_id != b.activity_id)
  )
ORDER BY b.department_id, b.activity_id, b.sous_activity_id
LIMIT 50;

-- Count invalid sous_activities
SELECT COUNT(*) AS total_invalid_sous_activity_rows
FROM budget b
LEFT JOIN budget_sous_activity bsa 
  ON bsa.id = b.sous_activity_id
  AND bsa.department_id = b.department_id
  AND (b.activity_id IS NULL OR bsa.activity_id = b.activity_id)
WHERE b.department_id IS NOT NULL
  AND b.sous_activity_id IS NOT NULL
  AND bsa.id IS NULL;

/* ============================================================================
   STEP 3: FIX - Set invalid activity_id to NULL
   ============================================================================
   This sets activity_id to NULL when it doesn't match the department.
   Also sets sous_activity_id to NULL since it depends on activity_id.
   ============================================================================ */

SELECT 'STEP 3: Fixing invalid activity_id (setting to NULL)...' AS step;

UPDATE budget b
LEFT JOIN budget_activity ba 
  ON ba.id = b.activity_id 
  AND ba.department_id = b.department_id
SET 
  b.activity_id = NULL,
  b.sous_activity_id = NULL  -- Must NULL this too since it depends on activity
WHERE b.department_id IS NOT NULL
  AND b.activity_id IS NOT NULL
  AND ba.id IS NULL;

SELECT ROW_COUNT() AS rows_updated_activity;

/* ============================================================================
   STEP 4: FIX - Set invalid sous_activity_id to NULL
   ============================================================================
   This sets sous_activity_id to NULL when it doesn't match department+activity
   ============================================================================ */

SELECT 'STEP 4: Fixing invalid sous_activity_id (setting to NULL)...' AS step;

UPDATE budget b
LEFT JOIN budget_sous_activity bsa 
  ON bsa.id = b.sous_activity_id
  AND bsa.department_id = b.department_id
  AND (b.activity_id IS NULL OR bsa.activity_id = b.activity_id)
SET b.sous_activity_id = NULL
WHERE b.department_id IS NOT NULL
  AND b.sous_activity_id IS NOT NULL
  AND bsa.id IS NULL;

SELECT ROW_COUNT() AS rows_updated_sous_activity;

/* ============================================================================
   STEP 5: VALIDATE - Check for remaining invalid references
   ============================================================================
   These queries should return 0 if the fix was successful
   ============================================================================ */

SELECT 'STEP 5: Validating fix...' AS step;

-- Should be 0 invalid activity references
SELECT COUNT(*) AS remaining_invalid_activity_rows
FROM budget b
LEFT JOIN budget_activity ba 
  ON ba.id = b.activity_id 
  AND ba.department_id = b.department_id
WHERE b.department_id IS NOT NULL
  AND b.activity_id IS NOT NULL
  AND ba.id IS NULL;

-- Should be 0 invalid sous_activity references
SELECT COUNT(*) AS remaining_invalid_sous_activity_rows
FROM budget b
LEFT JOIN budget_sous_activity bsa 
  ON bsa.id = b.sous_activity_id
  AND bsa.department_id = b.department_id
  AND (b.activity_id IS NULL OR bsa.activity_id = b.activity_id)
WHERE b.department_id IS NOT NULL
  AND b.sous_activity_id IS NOT NULL
  AND bsa.id IS NULL;

-- Show final state
SELECT
  COUNT(*) AS total_budget_rows,
  SUM(CASE WHEN activity_id IS NULL THEN 1 ELSE 0 END) AS null_activity,
  SUM(CASE WHEN sous_activity_id IS NULL THEN 1 ELSE 0 END) AS null_sous_activity,
  SUM(CASE WHEN activity_id IS NOT NULL THEN 1 ELSE 0 END) AS has_activity,
  SUM(CASE WHEN sous_activity_id IS NOT NULL THEN 1 ELSE 0 END) AS has_sous_activity
FROM budget
WHERE department_id IS NOT NULL;

/* ============================================================================
   OPTIONAL: Auto-assign valid activity_id and sous_activity_id
   ============================================================================
   
   ⚠️  DISABLED BY DEFAULT - Uncomment to use
   
   This section automatically assigns the first available valid activity/
   sous_activity for each department to budget rows that have NULL values.
   
   Only use this if:
   - You want to auto-populate NULL values
   - "Any valid activity" for the department is acceptable
   - You understand the business logic implications
   
   ============================================================================ */

-- -----------------------------------------------------------------------------
-- Auto-assign activity_id when NULL
-- Picks the first (MIN id) activity for each department
-- -----------------------------------------------------------------------------
/*
UPDATE budget b
INNER JOIN (
  SELECT department_id, MIN(id) AS first_activity_id
  FROM budget_activity
  GROUP BY department_id
) x ON x.department_id = b.department_id
SET b.activity_id = x.first_activity_id
WHERE b.department_id IS NOT NULL
  AND b.activity_id IS NULL
  AND EXISTS (
    SELECT 1 FROM budget_activity 
    WHERE department_id = b.department_id
  );

SELECT ROW_COUNT() AS rows_auto_assigned_activity;
*/

-- -----------------------------------------------------------------------------
-- Auto-assign sous_activity_id when NULL
-- Picks the first (MIN id) sous_activity for each department+activity combo
-- -----------------------------------------------------------------------------
/*
UPDATE budget b
INNER JOIN (
  SELECT department_id, activity_id, MIN(id) AS first_sous_activity_id
  FROM budget_sous_activity
  GROUP BY department_id, activity_id
) x ON x.department_id = b.department_id 
   AND x.activity_id = b.activity_id
SET b.sous_activity_id = x.first_sous_activity_id
WHERE b.department_id IS NOT NULL
  AND b.activity_id IS NOT NULL
  AND b.sous_activity_id IS NULL
  AND EXISTS (
    SELECT 1 FROM budget_sous_activity 
    WHERE department_id = b.department_id 
      AND activity_id = b.activity_id
  );

SELECT ROW_COUNT() AS rows_auto_assigned_sous_activity;
*/

/* ============================================================================
   FINAL STEP: Commit or Rollback
   ============================================================================
   
   IMPORTANT DECISION POINT:
   
   1. Review all query results above
   2. Check that validation shows 0 invalid rows
   3. Decide:
      - ROLLBACK = Cancel all changes (safe, use for testing)
      - COMMIT   = Apply all changes permanently
   
   ⚠️  TO FIX THE MISMATCHES: Comment out ROLLBACK and uncomment COMMIT
   
   ============================================================================ */

-- Option A: ROLLBACK (default - cancels all changes)
-- Comment this out when ready to apply fixes:
-- ROLLBACK;

-- Option B: COMMIT (uncomment to apply changes permanently)
-- ⚠️  ONLY UNCOMMENT AFTER REVIEWING RESULTS AND BACKING UP DATABASE
COMMIT;

/* ============================================================================
   DONE - Changes Applied!
   
   What just happened:
   - Invalid activity_id values have been set to NULL
   - Invalid sous_activity_id values have been set to NULL
   - Changes have been COMMITTED to the database
   
   Verification:
   - Check Step 5 results above - should show 0 invalid rows
   - Your /transactions/by-department/dz API should now work correctly
   - Only valid activities/sous_activities matching departments are shown
   
   Next steps:
   1. Test your API: GET /transactions/by-department/dz
   2. Records with NULL activity_id may need manual assignment
   3. Or run the optional auto-assign section if appropriate
   
   To auto-assign valid activities to NULL records:
   - Uncomment the optional auto-assign queries above
   - Run them separately
   
   ============================================================================ */
