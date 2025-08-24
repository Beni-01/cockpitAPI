import { MigrationInterface, QueryRunner } from "typeorm";

export class CHANGEVALIDATE1738934789336 implements MigrationInterface {
    name = 'CHANGEVALIDATE1738934789336'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`demande-user\` DROP COLUMN \`date_signature\``);
        await queryRunner.query(`ALTER TABLE \`demande-user\` DROP COLUMN \`isSign\``);

        await queryRunner.query(`ALTER TABLE \`user-livrable\` DROP COLUMN \`date_signature\``);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` DROP COLUMN \`isSign\``);

        await queryRunner.query(`ALTER TABLE \`demande-user\` ADD \`date_validation\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`demande-user\` ADD \`isValidate\` tinyint NOT NULL DEFAULT 0`);

        await queryRunner.query(`ALTER TABLE \`user-livrable\` ADD \`date_validation\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` ADD \`isValidate\` tinyint NOT NULL DEFAULT 0`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
