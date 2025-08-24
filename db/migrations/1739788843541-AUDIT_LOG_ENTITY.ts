import { MigrationInterface, QueryRunner } from "typeorm";

export class AUDITLOGENTITY1739788843541 implements MigrationInterface {
    name = 'AUDITLOGENTITY1739788843541'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`tableName\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD \`tableName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` CHANGE \`entityId\` \`entityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`action\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD \`action\` varchar(255) NULL`);

        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
