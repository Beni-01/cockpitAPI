
-- 1. Add new columns to google_sheet_config table
ALTER TABLE google_sheet_config
ADD COLUMN department_name VARCHAR(255) NULL AFTER id,
ADD COLUMN workbook_name VARCHAR(255) NULL AFTER department_name,
ADD COLUMN summary_tab_name VARCHAR(255) DEFAULT 'Summary' AFTER worksheet_name,
ADD COLUMN secondary_tab_name VARCHAR(255) NULL AFTER summary_tab_name,
ADD COLUMN sync_method ENUM('webhook', 'polling') DEFAULT 'webhook' AFTER auth_type,
ADD COLUMN polling_interval_minutes INT DEFAULT 5 AFTER sync_method,
ADD COLUMN priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium' AFTER is_active,
ADD COLUMN last_sync_status VARCHAR(50) NULL,
ADD COLUMN last_sync_message TEXT NULL,
ADD COLUMN last_sync_at TIMESTAMP NULL;

ALTER TABLE google_sheet_config
ADD INDEX idx_department (department_name),
ADD INDEX idx_priority (priority),
ADD INDEX idx_sync_method (sync_method);

-- 2. Add new columns to budget_data table
ALTER TABLE budget_data
ADD COLUMN config_id INT NULL AFTER id,
ADD COLUMN department_name VARCHAR(255) NULL AFTER config_id,
ADD COLUMN cost_center VARCHAR(255) NULL AFTER budget_category,
ADD COLUMN account_code VARCHAR(100) NULL AFTER cost_center,
ADD COLUMN budget_type ENUM('OPEX', 'CAPEX', 'Mixed') DEFAULT 'OPEX' AFTER remaining_amount,
ADD COLUMN fiscal_year INT NULL AFTER budget_period,
ADD COLUMN quarter INT NULL AFTER fiscal_year,
ADD COLUMN month INT NULL AFTER quarter,
ADD COLUMN approval_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'draft' AFTER status,
ADD COLUMN responsible_person VARCHAR(255) NULL AFTER notes,
ADD COLUMN province VARCHAR(255) NULL AFTER responsible_person,
ADD COLUMN territory VARCHAR(255) NULL AFTER province,
ADD COLUMN sync_hash VARCHAR(64) NULL AFTER last_synced_at;

ALTER TABLE budget_data
ADD INDEX idx_config_id (config_id),
ADD INDEX idx_department (department_name),
ADD INDEX idx_budget_type (budget_type),
ADD INDEX idx_fiscal_year (fiscal_year),
ADD INDEX idx_approval_status (approval_status);

-- 3. Create budget_data_change_log table (For Audit Logs)
CREATE TABLE IF NOT EXISTS budget_data_change_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    budget_data_id INT NOT NULL,
    config_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(100) DEFAULT 'sync',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_log_id INT,
    
    FOREIGN KEY (budget_data_id) REFERENCES budget_data(id) ON DELETE CASCADE,
    FOREIGN KEY (config_id) REFERENCES google_sheet_config(id) ON DELETE CASCADE,
    
    INDEX idx_budget_data_id (budget_data_id),
    INDEX idx_config_id (config_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_field_name (field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Department Summary View
CREATE OR REPLACE VIEW department_summary_view AS
SELECT 
    c.department_name,
    c.workbook_name,
    c.priority,
    COUNT(DISTINCT b.id) as total_projects,
    SUM(b.allocated_amount) as total_allocated,
    SUM(b.spent_amount) as total_spent,
    SUM(b.remaining_amount) as total_remaining,
    ROUND((SUM(b.spent_amount) / NULLIF(SUM(b.allocated_amount), 0)) * 100, 2) as utilization_percentage,
    MAX(b.last_synced_at) as last_updated,
    c.last_sync_status,
    c.sync_method,
    c.last_sync_at
FROM google_sheet_config c
LEFT JOIN budget_data b ON b.config_id = c.id AND b.status = 'active'
WHERE c.is_active = true
GROUP BY c.id, c.department_name, c.workbook_name, c.priority, c.last_sync_status, c.sync_method, c.last_sync_at
ORDER BY c.department_name;

-- 5. Add Foreign Key to budget_data (Run last to ensure config exists)
ALTER TABLE budget_data
ADD CONSTRAINT fk_budget_data_config
FOREIGN KEY (config_id) REFERENCES google_sheet_config(id) ON DELETE CASCADE;
