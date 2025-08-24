import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDFILELIVRABLENAME1732969136780 implements MigrationInterface {
    name = 'ADDFILELIVRABLENAME1732969136780'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`livrablefileName\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
