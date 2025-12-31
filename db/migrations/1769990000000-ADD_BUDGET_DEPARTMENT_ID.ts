import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDBUDGETDEPARTMENTID1769990000000 implements MigrationInterface {
    name = 'ADDBUDGETDEPARTMENTID1769990000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budget\` ADD COLUMN \`department_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD INDEX \`IDX_budget_department_id\` (\`department_id\`)`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_budget_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`department\`(\`id\`) ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_budget_department\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP INDEX \`IDX_budget_department_id\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP COLUMN \`department_id\``);
    }

}
