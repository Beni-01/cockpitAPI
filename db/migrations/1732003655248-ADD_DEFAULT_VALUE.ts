import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDEFAULTVALUE1732003655248 implements MigrationInterface {
    name = 'ADDDEFAULTVALUE1732003655248'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`reponse\` varchar(255) NOT NULL DEFAULT 'En attente'`);

        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
