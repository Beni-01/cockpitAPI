import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDIRECTIONACTIVITY1732290759862 implements MigrationInterface {
    name = 'ADDDIRECTIONACTIVITY1732290759862'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`direction\` varchar(255) NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
