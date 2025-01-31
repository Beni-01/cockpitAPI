import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDUSERLIVRABLE1738326432842 implements MigrationInterface {
    name = 'ADDUSERLIVRABLE1738326432842'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE \`user-livrable\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`livrableId\` int NOT NULL, \`date_signature\` datetime NULL, \`isSign\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
