-- Ensure `range` column exists on google_sheet_config
-- Adds the column if it does not already exist (MySQL 8+ supports IF NOT EXISTS)
ALTER TABLE `google_sheet_config`
ADD COLUMN IF NOT EXISTS `range` VARCHAR(255) NULL;

-- If your MySQL version does not support IF NOT EXISTS, run the following manually:
-- SET @exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'range');
-- SELECT @exists;
-- If @exists = 0 then run:
-- ALTER TABLE `google_sheet_config` ADD COLUMN `range` VARCHAR(255) NULL;