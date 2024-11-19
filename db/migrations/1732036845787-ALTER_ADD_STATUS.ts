import { MigrationInterface, QueryRunner } from "typeorm";

export class ALTERADDSTATUS1732036845787 implements MigrationInterface {
    name = 'ALTERADDSTATUS1732036845787'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
