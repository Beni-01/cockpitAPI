import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDNOTIFICATION1776976607055 implements MigrationInterface {
    name = 'ADDNOTIFICATION1776976607055'

    public async up(queryRunner: QueryRunner): Promise<void> {
       
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`type\` enum ('TAG', 'ASSIGNMENT', 'MESSAGE', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM', \`isRead\` tinyint NOT NULL DEFAULT 0, \`link\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
