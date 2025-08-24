import { MigrationInterface, QueryRunner } from "typeorm";

export class HOTMIGRATION21738595614462 implements MigrationInterface {
    name = 'HOTMIGRATION21738595614462'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`budget\` \`budget\` int NULL DEFAULT '0'`);

       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
