import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBudgetDataFields1766388344940 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add config_id and department fields to budget_data
        await queryRunner.query(`
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
            ADD COLUMN sync_hash VARCHAR(64) NULL AFTER last_synced_at
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE budget_data
            ADD CONSTRAINT fk_budget_data_config
            FOREIGN KEY (config_id) REFERENCES google_sheet_config(id) ON DELETE CASCADE
        `);

        // Add indexes for better query performance
        await queryRunner.query(`
            ALTER TABLE budget_data
            ADD INDEX idx_config_id (config_id),
            ADD INDEX idx_department (department_name),
            ADD INDEX idx_budget_type (budget_type),
            ADD INDEX idx_fiscal_year (fiscal_year),
            ADD INDEX idx_approval_status (approval_status)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes first
        await queryRunner.query(`
            ALTER TABLE budget_data
            DROP INDEX idx_approval_status,
            DROP INDEX idx_fiscal_year,
            DROP INDEX idx_budget_type,
            DROP INDEX idx_department,
            DROP INDEX idx_config_id
        `);

        // Remove foreign key
        await queryRunner.query(`
            ALTER TABLE budget_data
            DROP FOREIGN KEY fk_budget_data_config
        `);

        // Remove columns
        await queryRunner.query(`
            ALTER TABLE budget_data
            DROP COLUMN sync_hash,
            DROP COLUMN territory,
            DROP COLUMN province,
            DROP COLUMN responsible_person,
            DROP COLUMN approval_status,
            DROP COLUMN month,
            DROP COLUMN quarter,
            DROP COLUMN fiscal_year,
            DROP COLUMN budget_type,
            DROP COLUMN account_code,
            DROP COLUMN cost_center,
            DROP COLUMN department_name,
            DROP COLUMN config_id
        `);
    }

}
