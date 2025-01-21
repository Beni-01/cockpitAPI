import { MigrationInterface, QueryRunner } from "typeorm";

export class TEXTTITRE1737484866386 implements MigrationInterface {
    name = 'TEXTTITRE1737484866386'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`titre\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`titre\` text NOT NULL`);

       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
