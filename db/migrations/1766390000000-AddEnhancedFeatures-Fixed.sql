-- Migration for new features: Snapshots, Queue, Caching, Validation
-- Fixed for MySQL 5.7+ compatibility

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
    
    FOREIGN KEY (config_id) REFERENCES google_sheet_config(id) ON DELETE CASCADE,
    
    INDEX idx_config_created (config_id, created_at),
    INDEX idx_snapshot_type (snapshot_type),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add validation tracking columns to budget_data (check if exists first)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validation_status');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validation_status ENUM(''pending'', ''valid'', ''invalid'', ''warning'') DEFAULT ''pending'' AFTER sync_hash', 
    'SELECT ''Column validation_status already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validation_errors');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validation_errors TEXT NULL AFTER validation_status', 
    'SELECT ''Column validation_errors already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validation_warnings');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validation_warnings TEXT NULL AFTER validation_errors', 
    'SELECT ''Column validation_warnings already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND column_name = 'validated_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE budget_data ADD COLUMN validated_at TIMESTAMP NULL AFTER validation_warnings', 
    'SELECT ''Column validated_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add indexes for validation queries
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND index_name = 'idx_validation_status');
SET @sql = IF(@index_exists = 0, 
    'ALTER TABLE budget_data ADD INDEX idx_validation_status (validation_status)', 
    'SELECT ''Index idx_validation_status already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add queue tracking columns to sync_log
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'queue_job_id');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN queue_job_id VARCHAR(100) NULL AFTER id', 
    'SELECT ''Column queue_job_id already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'queue_priority');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN queue_priority ENUM(''low'', ''normal'', ''high'', ''critical'') DEFAULT ''normal'' AFTER queue_job_id', 
    'SELECT ''Column queue_priority already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'queued_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN queued_at TIMESTAMP NULL AFTER queue_priority', 
    'SELECT ''Column queued_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND column_name = 'processing_started_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD COLUMN processing_started_at TIMESTAMP NULL AFTER queued_at', 
    'SELECT ''Column processing_started_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Add indexes for queue queries
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND index_name = 'idx_queue_job_id');
SET @sql = IF(@index_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD INDEX idx_queue_job_id (queue_job_id)', 
    'SELECT ''Index idx_queue_job_id already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND index_name = 'idx_queue_priority');
SET @sql = IF(@index_exists = 0, 
    'ALTER TABLE google_sheet_sync_log ADD INDEX idx_queue_priority (queue_priority)', 
    'SELECT ''Index idx_queue_priority already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Create data_validation_rules table
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
    
    FOREIGN KEY (config_id) REFERENCES google_sheet_config(id) ON DELETE CASCADE,
    
    INDEX idx_config_field (config_id, field_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create cache_metadata table
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

-- 8. Add snapshot tracking to google_sheet_config
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'auto_snapshot');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_config ADD COLUMN auto_snapshot BOOLEAN DEFAULT TRUE AFTER use_polling', 
    'SELECT ''Column auto_snapshot already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'snapshot_retention_days');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_config ADD COLUMN snapshot_retention_days INT DEFAULT 30 AFTER auto_snapshot', 
    'SELECT ''Column snapshot_retention_days already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_config' AND column_name = 'last_snapshot_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE google_sheet_config ADD COLUMN last_snapshot_at TIMESTAMP NULL AFTER snapshot_retention_days', 
    'SELECT ''Column last_snapshot_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. Create view for sync statistics
CREATE OR REPLACE VIEW sync_statistics_view AS
SELECT 
    c.id as config_id,
    c.name as config_name,
    COUNT(DISTINCT l.id) as total_syncs,
    SUM(CASE WHEN l.status = 'success' THEN 1 ELSE 0 END) as successful_syncs,
    SUM(CASE WHEN l.status = 'failed' THEN 1 ELSE 0 END) as failed_syncs,
    SUM(l.records_processed) as total_records_processed,
    AVG(TIMESTAMPDIFF(SECOND, l.started_at, l.completed_at)) as avg_sync_duration_seconds,
    MAX(l.started_at) as last_sync_at,
    (SELECT COUNT(*) FROM sync_snapshots s WHERE s.config_id = c.id) as snapshot_count,
    (SELECT COUNT(*) FROM budget_data b WHERE b.config_id = c.id AND b.validation_status = 'invalid') as invalid_records_count
FROM google_sheet_config c
LEFT JOIN google_sheet_sync_log l ON c.id = l.config_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name;

-- 10. Create indexes for performance
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() AND table_name = 'budget_data' AND index_name = 'idx_budget_data_config_validated');
SET @sql = IF(@index_exists = 0, 
    'CREATE INDEX idx_budget_data_config_validated ON budget_data(config_id, validated_at)', 
    'SELECT ''Index idx_budget_data_config_validated already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() AND table_name = 'google_sheet_sync_log' AND index_name = 'idx_sync_log_status_started');
SET @sql = IF(@index_exists = 0, 
    'CREATE INDEX idx_sync_log_status_started ON google_sheet_sync_log(status, started_at)', 
    'SELECT ''Index idx_sync_log_status_started already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 11. Add comments for documentation
ALTER TABLE sync_snapshots 
COMMENT = 'Stores snapshots of budget data for rollback capability';

ALTER TABLE data_validation_rules 
COMMENT = 'Custom validation rules for Google Sheets data';

ALTER TABLE cache_metadata 
COMMENT = 'Tracks cache hit/miss statistics for optimization';
