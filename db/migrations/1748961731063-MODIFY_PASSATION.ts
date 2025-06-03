import { MigrationInterface, QueryRunner } from "typeorm";

export class MODIFYPASSATION1748961731063 implements MigrationInterface {
    name = 'MODIFYPASSATION1748961731063'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`intitule\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`intitule\` text NOT NULL`);

       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
