import { MigrationInterface, QueryRunner } from "typeorm";

export class ALTERACTIVITY1732557894175 implements MigrationInterface {
    name = 'ALTERACTIVITY1732557894175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`budget\` \`budget\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
