import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDKPIs1744734867748 implements MigrationInterface {
    name = 'ADDKPIs1744734867748'

    public async up(queryRunner: QueryRunner): Promise<void> {
  

        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`livrableQuality\` int(3) NULL`);

       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
