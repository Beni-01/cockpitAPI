import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDEMANDEPROLOGATIONVALIDATION1738330475575 implements MigrationInterface {
    name = 'ADDDEMANDEPROLOGATIONVALIDATION1738330475575'

    public async up(queryRunner: QueryRunner): Promise<void> {
   
        await queryRunner.query(`CREATE TABLE \`demande-user\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`demandeId\` int NOT NULL, \`date_signature\` datetime NULL, \`isSign\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
