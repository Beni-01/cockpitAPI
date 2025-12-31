import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDEPARTMENTLOOKUPS1770000000001 implements MigrationInterface {
    name = 'ADDDEPARTMENTLOOKUPS1770000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD COLUMN ` + "`mapping_cash_flow_id`" + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD COLUMN ` + "`activity_id`" + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD COLUMN ` + "`sous_activity_id`" + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD COLUMN ` + "`tache_id`" + ` int NULL`);

        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD CONSTRAINT ` + "`FK_department_mapping_cash_flow`" + ` FOREIGN KEY (` + "`mapping_cash_flow_id`" + `) REFERENCES ` + "`mapping_cash_flow`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD CONSTRAINT ` + "`FK_department_activity`" + ` FOREIGN KEY (` + "`activity_id`" + `) REFERENCES ` + "`budget_activity`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD CONSTRAINT ` + "`FK_department_sous_activity`" + ` FOREIGN KEY (` + "`sous_activity_id`" + `) REFERENCES ` + "`budget_sous_activity`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` ADD CONSTRAINT ` + "`FK_department_tache`" + ` FOREIGN KEY (` + "`tache_id`" + `) REFERENCES ` + "`budget_tache`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP FOREIGN KEY ` + "`FK_department_tache`" );
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP FOREIGN KEY ` + "`FK_department_sous_activity`" );
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP FOREIGN KEY ` + "`FK_department_activity`" );
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP FOREIGN KEY ` + "`FK_department_mapping_cash_flow`" );

        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP COLUMN ` + "`tache_id`" );
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP COLUMN ` + "`sous_activity_id`" );
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP COLUMN ` + "`activity_id`" );
        await queryRunner.query(`ALTER TABLE ` + "`department`" + ` DROP COLUMN ` + "`mapping_cash_flow_id`" );
    }

}
