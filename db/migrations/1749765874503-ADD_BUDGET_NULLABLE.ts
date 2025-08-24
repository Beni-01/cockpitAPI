import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDBUDGETNULLABLE1749765874503 implements MigrationInterface {
    name = 'ADDBUDGETNULLABLE1749765874503'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`budget\` \`budget\` int NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
