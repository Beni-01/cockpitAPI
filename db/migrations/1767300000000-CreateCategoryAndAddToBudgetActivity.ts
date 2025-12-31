import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryAndAddToBudgetActivity1767300000000 implements MigrationInterface {
  name = 'CreateCategoryAndAddToBudgetActivity1767300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`ALTER TABLE \`budget_activity\` ADD COLUMN \`category_id\` int NULL`);
    await queryRunner.query(`ALTER TABLE \`budget_activity\` ADD CONSTRAINT \`FK_budget_activity_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`budget_activity\` DROP FOREIGN KEY \`FK_budget_activity_category\``);
    await queryRunner.query(`ALTER TABLE \`budget_activity\` DROP COLUMN \`category_id\``);
    await queryRunner.query(`DROP TABLE \`category\``);
  }
}
