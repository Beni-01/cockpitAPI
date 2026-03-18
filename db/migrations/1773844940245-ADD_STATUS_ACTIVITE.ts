import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDSTATUSACTIVITE1773844940245 implements MigrationInterface {
    name = 'ADDSTATUSACTIVITE1773844940245'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`activite_26\` CHANGE \`T5\` \`status\` varchar(255) NOT NULL`);

       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      
    }

}
