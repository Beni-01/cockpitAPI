import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMappingCashFlowToActivity1790500000000 implements MigrationInterface {
    name = 'AddMappingCashFlowToActivity1790500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` ADD COLUMN \`mapping_cash_flow_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_activity_mapping_cash_flow\` FOREIGN KEY (\`mapping_cash_flow_id\`) REFERENCES \`mapping_cash_flow\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_activity_mapping_cash_flow\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`mapping_cash_flow_id\``);
    }
}
