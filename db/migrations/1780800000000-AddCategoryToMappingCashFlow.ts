import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToMappingCashFlow1780800000000 implements MigrationInterface {
  name = 'AddCategoryToMappingCashFlow1780800000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` ADD COLUMN \`category_id\` int NULL`);
    await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` ADD CONSTRAINT \`FK_mapping_cash_flow_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` DROP FOREIGN KEY \`FK_mapping_cash_flow_category\``);
    await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` DROP COLUMN \`category_id\``);
  }
}
