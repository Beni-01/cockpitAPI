import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDIGID1738319086349 implements MigrationInterface {
    name = 'ADDDIGID1738319086349'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`user\` ADD \`directionGeneraleId\` int NULL`);

        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
