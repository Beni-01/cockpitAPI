import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDCOORDINATIONIDUSER1781087044095 implements MigrationInterface {
    name = 'ADDCOORDINATIONIDUSER1781087044095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`coordinationId\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
