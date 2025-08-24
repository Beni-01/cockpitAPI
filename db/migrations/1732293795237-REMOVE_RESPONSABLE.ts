import { MigrationInterface, QueryRunner } from "typeorm";

export class REMOVERESPONSABLE1732293795237 implements MigrationInterface {
    name = 'REMOVERESPONSABLE1732293795237'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`responsable\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
