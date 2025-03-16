import { MigrationInterface, QueryRunner } from "typeorm";

export class CHANGETYPEDECLARATION1742130043568 implements MigrationInterface {
    name = 'CHANGETYPEDECLARATION1742130043568'

    public async up(queryRunner: QueryRunner): Promise<void> {
     
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`description\` text NOT NULL`);

        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`commentaire\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`commentaire\` text NOT NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
