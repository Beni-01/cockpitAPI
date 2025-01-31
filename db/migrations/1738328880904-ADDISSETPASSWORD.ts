import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDISSETPASSWORD1738328880904 implements MigrationInterface {
    name = 'ADDISSETPASSWORD1738328880904'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`user\` ADD \`isSetPassword\` tinyint NOT NULL DEFAULT 0`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
