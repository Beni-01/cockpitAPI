import { MigrationInterface, QueryRunner } from "typeorm";

export class ALTERACTIVITYLOG1732558223308 implements MigrationInterface {
    name = 'ALTERACTIVITYLOG1732558223308'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE \`auditLog\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`tableName\` varchar(255) NOT NULL, \`entityId\` int NOT NULL, \`action\` varchar(255) NOT NULL, \`oldData\` json NULL, \`newData\` json NULL, \`performedBy\` int NULL, \`performedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
