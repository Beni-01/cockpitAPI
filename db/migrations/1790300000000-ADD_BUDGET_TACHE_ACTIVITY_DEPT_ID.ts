import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDBUDGETTACHEACTIVITYDEPTID1790300000000 implements MigrationInterface {
    name = 'ADDBUDGETTACHEACTIVITYDEPTID1790300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` ADD COLUMN ` + '`activity_id`' + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` ADD COLUMN ` + '`department_id`' + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` ADD INDEX ` + '`IDX_budget_tache_activity_id`' + ` (` + '`activity_id`' + `)`);
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` ADD INDEX ` + '`IDX_budget_tache_department_id`' + ` (` + '`department_id`' + `)`);
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` ADD CONSTRAINT ` + '`FK_budget_tache_activity`' + ` FOREIGN KEY (` + '`activity_id`' + `) REFERENCES ` + '`budget_activity`' + `(` + '`id`' + `) ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` ADD CONSTRAINT ` + '`FK_budget_tache_department`' + ` FOREIGN KEY (` + '`department_id`' + `) REFERENCES ` + '`department`' + `(` + '`id`' + `) ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` DROP FOREIGN KEY ` + '`FK_budget_tache_department`' );
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` DROP FOREIGN KEY ` + '`FK_budget_tache_activity`' );
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` DROP INDEX ` + '`IDX_budget_tache_department_id`' );
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` DROP INDEX ` + '`IDX_budget_tache_activity_id`' );
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` DROP COLUMN ` + '`department_id`' );
        await queryRunner.query(`ALTER TABLE ` + '`budget_tache`' + ` DROP COLUMN ` + '`activity_id`' );
    }

}
