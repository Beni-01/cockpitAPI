import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDLIEU1777370651557 implements MigrationInterface {
    name = 'ADDLIEU1777370651557'

    public async up(queryRunner: QueryRunner): Promise<void> {
       
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`coordination\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`lieuExecution\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`coordination\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`lieuExecution\` varchar(255) NULL`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
     
    }

}
