import { MigrationInterface, QueryRunner } from "typeorm";

export class CREATEBUDGETLOOKUPS1780300000000 implements MigrationInterface {
    name = 'CREATEBUDGETLOOKUPS1780300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE ` + "`mapping_cash_flow`" + ` (
              ` + "`id`" + ` int NOT NULL AUTO_INCREMENT,
              ` + "`name`" + ` varchar(255) NOT NULL,
              PRIMARY KEY (` + "`id`" + `)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE ` + "`budget_activity`" + ` (
              ` + "`id`" + ` int NOT NULL AUTO_INCREMENT,
              ` + "`mapping_cash_flow_id`" + ` int NULL,
              ` + "`name`" + ` varchar(255) NULL,
              ` + "`code`" + ` varchar(100) NULL,
              PRIMARY KEY (` + "`id`" + `)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE ` + "`budget_sous_activity`" + ` (
              ` + "`id`" + ` int NOT NULL AUTO_INCREMENT,
              ` + "`activity_id`" + ` int NULL,
              ` + "`name`" + ` varchar(255) NULL,
              ` + "`code`" + ` varchar(100) NULL,
              PRIMARY KEY (` + "`id`" + `)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE ` + "`budget_tache`" + ` (
              ` + "`id`" + ` int NOT NULL AUTO_INCREMENT,
              ` + "`sous_activity_id`" + ` int NULL,
              ` + "`name`" + ` varchar(255) NULL,
              ` + "`code`" + ` varchar(100) NULL,
              ` + "`cost_code`" + ` varchar(100) NULL,
              PRIMARY KEY (` + "`id`" + `)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD COLUMN ` + "`mapping_cash_flow_id`" + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD COLUMN ` + "`activity_id`" + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD COLUMN ` + "`sous_activity_id`" + ` int NULL`);
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD COLUMN ` + "`tache_id`" + ` int NULL`);

        await queryRunner.query(`ALTER TABLE ` + "`budget_activity`" + ` ADD CONSTRAINT ` + "`FK_budget_activity_mapping`" + ` FOREIGN KEY (` + "`mapping_cash_flow_id`" + `) REFERENCES ` + "`mapping_cash_flow`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`budget_sous_activity`" + ` ADD CONSTRAINT ` + "`FK_budget_sous_activity_activity`" + ` FOREIGN KEY (` + "`activity_id`" + `) REFERENCES ` + "`budget_activity`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`budget_tache`" + ` ADD CONSTRAINT ` + "`FK_budget_tache_sous_activity`" + ` FOREIGN KEY (` + "`sous_activity_id`" + `) REFERENCES ` + "`budget_sous_activity`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD CONSTRAINT ` + "`FK_budget_mapping_cash_flow`" + ` FOREIGN KEY (` + "`mapping_cash_flow_id`" + `) REFERENCES ` + "`mapping_cash_flow`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD CONSTRAINT ` + "`FK_budget_activity`" + ` FOREIGN KEY (` + "`activity_id`" + `) REFERENCES ` + "`budget_activity`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD CONSTRAINT ` + "`FK_budget_sous_activity`" + ` FOREIGN KEY (` + "`sous_activity_id`" + `) REFERENCES ` + "`budget_sous_activity`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` ADD CONSTRAINT ` + "`FK_budget_tache`" + ` FOREIGN KEY (` + "`tache_id`" + `) REFERENCES ` + "`budget_tache`" + `(` + "`id`" + `) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP FOREIGN KEY ` + "`FK_budget_tache`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP FOREIGN KEY ` + "`FK_budget_sous_activity`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP FOREIGN KEY ` + "`FK_budget_activity`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP FOREIGN KEY ` + "`FK_budget_mapping_cash_flow`" );

        await queryRunner.query(`ALTER TABLE ` + "`budget_tache`" + ` DROP FOREIGN KEY ` + "`FK_budget_tache_sous_activity`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget_sous_activity`" + ` DROP FOREIGN KEY ` + "`FK_budget_sous_activity_activity`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget_activity`" + ` DROP FOREIGN KEY ` + "`FK_budget_activity_mapping`" );

        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP COLUMN ` + "`tache_id`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP COLUMN ` + "`sous_activity_id`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP COLUMN ` + "`activity_id`" );
        await queryRunner.query(`ALTER TABLE ` + "`budget`" + ` DROP COLUMN ` + "`mapping_cash_flow_id`" );

        await queryRunner.query(`DROP TABLE ` + "`budget_tache`" );
        await queryRunner.query(`DROP TABLE ` + "`budget_sous_activity`" );
        await queryRunner.query(`DROP TABLE ` + "`budget_activity`" );
        await queryRunner.query(`DROP TABLE ` + "`mapping_cash_flow`" );
    }

}
