import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDepartmentSummaryView1766388376751 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create view for department summary statistics
        await queryRunner.query(`
            CREATE VIEW department_summary_view AS
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
            ORDER BY c.department_name
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the view
        await queryRunner.query(`DROP VIEW IF EXISTS department_summary_view`);
    }

}
