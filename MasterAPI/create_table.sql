-- ════════════════════════════════════════════════════════════════
-- Master API Database Setup
-- Copy this entire file and paste in phpMyAdmin SQL tab
-- ════════════════════════════════════════════════════════════════

-- Create table for Master Budget data
CREATE TABLE IF NOT EXISTS master_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(255) COMMENT 'Column B - Department',
    activity VARCHAR(255) COMMENT 'Column C - Activity',
    sub_activity VARCHAR(255) COMMENT 'Column D - Sub Activity',
    task VARCHAR(255) COMMENT 'Column E - Task',
    column_f VARCHAR(255) COMMENT 'Column F',
    column_g VARCHAR(255) COMMENT 'Column G',
    column_h VARCHAR(255) COMMENT 'Column H',
    column_i VARCHAR(255) COMMENT 'Column I',
    column_j VARCHAR(255) COMMENT 'Column J',
    column_k VARCHAR(255) COMMENT 'Column K',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_activity (activity),
    INDEX idx_sub_activity (sub_activity),
    INDEX idx_task (task),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master Budget data from Excel columns B to K';
