-- Minimal Migration - Only Add Missing Features
-- Compatible with existing F360DB schema

-- 1. Create sync_snapshots table for rollback capability
CREATE TABLE IF NOT EXISTS sync_snapshots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_id INT NOT NULL,
    sync_log_id INT NULL,
    snapshot_data LONGTEXT NOT NULL,
    record_count INT DEFAULT 0,
    snapshot_hash VARCHAR(64) NULL,
    description TEXT NULL,
    snapshot_type ENUM('pre_sync', 'post_sync', 'manual') DEFAULT 'pre_sync',
    created_by VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_restored BOOLEAN DEFAULT FALSE,
    restored_at TIMESTAMP NULL,
    
    INDEX idx_config_created (config_id, created_at),
    INDEX idx_snapshot_type (snapshot_type),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add validation tracking columns to budget_data
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validation_status');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validation_status ENUM(''pending'', ''valid'', ''invalid'', ''warning'') DEFAULT ''pending''', 
    'SELECT ''Column validation_status already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validation_errors');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validation_errors TEXT NULL', 
    'SELECT ''Column validation_errors already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validation_warnings');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validation_warnings TEXT NULL', 
    'SELECT ''Column validation_warnings already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validated_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validated_at TIMESTAMP NULL', 
    'SELECT ''Column validated_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add queue tracking columns to sync_log
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'queue_job_id');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN queue_job_id VARCHAR(100) NULL', 
    'SELECT ''Column queue_job_id already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'queue_priority');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN queue_priority ENUM(''low'', ''normal'', ''high'', ''critical'') DEFAULT ''normal''', 
    'SELECT ''Column queue_priority already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'queued_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN queued_at TIMESTAMP NULL', 
    'SELECT ''Column queued_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'processing_started_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN processing_started_at TIMESTAMP NULL', 
    'SELECT ''Column processing_started_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add snapshot tracking to google_sheet_config
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'auto_snapshot');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_config ADD COLUMN auto_snapshot BOOLEAN DEFAULT TRUE', 
    'SELECT ''Column auto_snapshot already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'snapshot_retention_days');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_config ADD COLUMN snapshot_retention_days INT DEFAULT 30', 
    'SELECT ''Column snapshot_retention_days already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'last_snapshot_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_config ADD COLUMN last_snapshot_at TIMESTAMP NULL', 
    'SELECT ''Column last_snapshot_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Create data_validation_rules table
CREATE TABLE IF NOT EXISTS data_validation_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    rule_type ENUM('required', 'type', 'range', 'pattern', 'custom') NOT NULL,
    rule_value TEXT NULL,
    error_message VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_field (config_id, field_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create cache_metadata table
CREATE TABLE IF NOT EXISTS cache_metadata (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    hit_count INT DEFAULT 0,
    miss_count INT DEFAULT 0,
    last_hit_at TIMESTAMP NULL,
    last_miss_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cache_key (cache_key),
    INDEX idx_hit_count (hit_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Add indexes
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND index_name = 'idx_validation_status');
SET @sql = IF(@index_exists = 0, 
    'ALTER TABLE budget_data ADD INDEX idx_validation_status (validation_status)', 
    'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND index_name = 'idx_queue_job_id');
SET @sql = IF(@index_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD INDEX idx_queue_job_id (queue_job_id)', 
    'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Done!
SELECT '✅ Migration completed successfully!' as Status;
