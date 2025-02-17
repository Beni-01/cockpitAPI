import { MigrationInterface, QueryRunner } from "typeorm";

export class AUDITLOGUSERID1739787266488 implements MigrationInterface {
    name = 'AUDITLOGUSERID1739787266488'

    public async up(queryRunner: QueryRunner): Promise<void> {
 
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`performedAt\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`performedBy\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD \`userId\` int NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
