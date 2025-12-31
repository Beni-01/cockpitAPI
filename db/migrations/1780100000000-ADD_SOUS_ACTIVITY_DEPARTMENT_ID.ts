import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDSOUSACTIVITYDEPARTMENTID1780100000000 implements MigrationInterface {
    name = 'ADDSOUSACTIVITYDEPARTMENTID1780100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + '`budget_sous_activity`' + ` ADD COLUMN ` + '`department_id`' + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + '`budget_sous_activity`' + ` ADD INDEX ` + '`IDX_budget_sous_activity_department_id`' + ` (` + '`department_id`' + `)`);
        await queryRunner.query(`ALTER TABLE ` + '`budget_sous_activity`' + ` ADD CONSTRAINT ` + '`FK_budget_sous_activity_department`' + ` FOREIGN KEY (` + '`department_id`' + `) REFERENCES ` + '`department`' + `(` + '`id`' + `) ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + '`budget_sous_activity`' + ` DROP FOREIGN KEY ` + '`FK_budget_sous_activity_department`' );
        await queryRunner.query(`ALTER TABLE ` + '`budget_sous_activity`' + ` DROP INDEX ` + '`IDX_budget_sous_activity_department_id`' );
        await queryRunner.query(`ALTER TABLE ` + '`budget_sous_activity`' + ` DROP COLUMN ` + '`department_id`' );
    }

}
