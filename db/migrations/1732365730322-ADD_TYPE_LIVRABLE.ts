import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDTYPELIVRABLE1732365730322 implements MigrationInterface {
    name = 'ADDTYPELIVRABLE1732365730322'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`typelivrable\` varchar(255) NULL`);

       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
