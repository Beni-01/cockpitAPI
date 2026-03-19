import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDSTATUSDEFAULT1773916036678 implements MigrationInterface {
    name = 'ADDSTATUSDEFAULT1773916036678'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`activite_26\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`activite_26\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);

      
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
       


}
