import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDPASSWORDDEFAULTVALUE1738333626284 implements MigrationInterface {
    name = 'ADDPASSWORDDEFAULTVALUE1738333626284'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE \`user\` 
            MODIFY COLUMN \`password\` VARCHAR(255) NOT NULL DEFAULT 'N/A'
        `);

        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
