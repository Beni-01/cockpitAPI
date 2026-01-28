import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDPERIODDATE1768682889143 implements MigrationInterface {
    name = 'ADDPERIODDATE1768682889143'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`disbursements\` ADD \`periodDate\` date NULL`);

 
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
     
    }

}
