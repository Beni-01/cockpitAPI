import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDEFAULTDOC1768999099231 implements MigrationInterface {
    name = 'ADDDEFAULTDOC1768999099231'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`disbursements\` CHANGE \`supportingDocumentation\` \`supportingDocumentation\` text NULL `);
        
      
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      
    }

}
