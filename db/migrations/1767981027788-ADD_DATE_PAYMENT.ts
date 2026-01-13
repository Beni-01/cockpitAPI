import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDATEPAYMENT1767981027788 implements MigrationInterface {
    name = 'ADDDATEPAYMENT1767981027788'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`disbursements\` ADD \`datePayment\` date  NULL`);

  
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
