import { MigrationInterface, QueryRunner } from "typeorm";

export class ALTERBUDGETTACHENAME1779999999999 implements MigrationInterface {
    name = 'ALTERBUDGETTACHENAME1779999999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + "`budget_tache`" + ` MODIFY ` + "`name`" + ` TEXT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + "`budget_tache`" + ` MODIFY ` + "`name`" + ` varchar(255) NULL`);
    }

}
