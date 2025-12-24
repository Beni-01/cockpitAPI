import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBudgetDataChangeLog1766389000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create table to track budget data changes
        await queryRunner.query(`
            CREATE TABLE budget_data_change_log (
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
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS budget_data_change_log`);
    }

}
