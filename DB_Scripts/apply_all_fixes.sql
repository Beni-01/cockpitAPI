-- Apply all fixes in one file
-- 1) Ensure `range` column exists on `google_sheet_config`
-- 2) Create a full backup of `transaction` with `cont_center` from `budget`

-- Run this script with your MySQL client against the target database.
-- Example:
-- mysql -u USER -p YOUR_DB < DB_Scripts/apply_all_fixes.sql

-- 1) Add `range` column if missing (safe for MySQL 5.7+/8)
ALTER TABLE `google_sheet_config` ADD COLUMN IF NOT EXISTS `range` VARCHAR(255) NULL;

-- Fallback safe method (works even if IF NOT EXISTS is not supported):
SET @cnt = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'google_sheet_config'
    AND column_name = 'range');
SET @sql = IF(@cnt = 0, 'ALTER TABLE `google_sheet_config` ADD COLUMN `range` VARCHAR(255) NULL;', 'SELECT "google_sheet_config.range already exists";');
PREPARE _stmt FROM @sql;
EXECUTE _stmt;
DEALLOCATE PREPARE _stmt;

-- 2) Create backup table with cost_center (cont_center) joined from `budget`
DROP TABLE IF EXISTS `transactions_backup_with_cost_center`;

CREATE TABLE `transactions_backup_with_cost_center` AS
SELECT
  t.*,
  b.cost_center AS cont_center
FROM `transaction` t
LEFT JOIN `budget` b
  ON t.centreId = b.id;

-- Optional index for faster lookups on cont_center
CREATE INDEX IF NOT EXISTS idx_transactions_backup_cont_center ON `transactions_backup_with_cost_center` (cont_center);

-- Done
SELECT 'APPLY_ALL_FIXES_COMPLETE' AS result;
