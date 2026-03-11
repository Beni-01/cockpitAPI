import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDGENERATEACTIVITE20261773248758053 implements MigrationInterface {
    name = 'ADDGENERATEACTIVITE20261773248758053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`activite_26\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`objectif\` text NOT NULL, \`activite\` text NOT NULL, \`T1\` varchar(255) NOT NULL, \`T2\` varchar(255) NOT NULL, \`T3\` varchar(255) NOT NULL, \`T4\` varchar(255) NOT NULL, \`T5\` varchar(255) NOT NULL, \`budget\` decimal(20,2) NOT NULL, \`direction\` varchar(255) NOT NULL, \`observation\` text NOT NULL, INDEX \`IDX_886e6145ed01bdb1ee9af8460f\` (\`direction\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      
    }

}
