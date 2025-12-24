import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentFields1766388203580 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add department-related fields to google_sheet_config
        await queryRunner.query(`
            ALTER TABLE google_sheet_config
            ADD COLUMN department_name VARCHAR(255) NULL AFTER id,
            ADD COLUMN workbook_name VARCHAR(255) NULL AFTER department_name,
            ADD COLUMN summary_tab_name VARCHAR(255) DEFAULT 'Summary' AFTER worksheet_name,
            ADD COLUMN secondary_tab_name VARCHAR(255) NULL AFTER summary_tab_name,
            ADD COLUMN sync_method ENUM('webhook', 'polling') DEFAULT 'webhook' AFTER auth_type,
            ADD COLUMN polling_interval_minutes INT DEFAULT 5 AFTER sync_method,
            ADD COLUMN priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium' AFTER is_active
        `);

        // Add indexes for better query performance
        await queryRunner.query(`
            ALTER TABLE google_sheet_config
            ADD INDEX idx_department (department_name),
            ADD INDEX idx_priority (priority),
            ADD INDEX idx_sync_method (sync_method)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes first
        await queryRunner.query(`
            ALTER TABLE google_sheet_config
            DROP INDEX idx_sync_method,
            DROP INDEX idx_priority,
            DROP INDEX idx_department
        `);

        // Remove columns
        await queryRunner.query(`
            ALTER TABLE google_sheet_config
            DROP COLUMN priority,
            DROP COLUMN polling_interval_minutes,
            DROP COLUMN sync_method,
            DROP COLUMN secondary_tab_name,
            DROP COLUMN summary_tab_name,
            DROP COLUMN workbook_name,
            DROP COLUMN department_name
        `);
    }

}
