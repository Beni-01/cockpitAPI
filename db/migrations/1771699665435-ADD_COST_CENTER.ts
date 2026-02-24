import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDCOSTCENTER1771699665435 implements MigrationInterface {
    name = 'ADDCOSTCENTER1771699665435'

    public async up(queryRunner: QueryRunner): Promise<void> {
         
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`cost_center\` varchar(255) NULL COMMENT 'centre de coût associé à la transaction (ex: IT, RH, Marketing)'`);
       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
