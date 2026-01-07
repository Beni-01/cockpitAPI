import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssignedDepartmentIdToBudget1790800000000 implements MigrationInterface {
    name = 'AddAssignedDepartmentIdToBudget1790800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const has = await queryRunner.hasColumn('budget', 'assigned_department_id');
        if (!has) {
            await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD COLUMN ` + "`assigned_department_id`" + ` int NULL`);
        }

        try {
            await queryRunner.query(`CREATE INDEX ` + "`IDX_budget_assigned_department_id`" + ` ON ` + "`budget`" + ` (` + "`assigned_department_id`" + `)`);
        } catch (e) {
            // ignore index creation errors
        }

        if (await queryRunner.hasTable('department')) {
            try {
                await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD CONSTRAINT ` + "`FK_budget_assigned_department`" + ` FOREIGN KEY (` + "`assigned_department_id`" + `) REFERENCES ` + "`department`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
            } catch (e) {
                // ignore if FK exists
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP FOREIGN KEY ` + "`FK_budget_assigned_department`" );
        } catch (e) {
            // ignore
        }

        try {
            await queryRunner.query(`DROP INDEX ` + "`IDX_budget_assigned_department_id`" + ` ON ` + "`budget`" );
        } catch (e) {
            // ignore
        }

        if (await queryRunner.hasColumn('budget', 'assigned_department_id')) {
            await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP COLUMN ` + "`assigned_department_id`" );
        }
    }
}
