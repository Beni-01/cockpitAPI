import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDCOMMENTVALIDATIONLD1739290117940 implements MigrationInterface {
    name = 'ADDCOMMENTVALIDATIONLD1739290117940'

    public async up(queryRunner: QueryRunner): Promise<void> {
 

        await queryRunner.query(`ALTER TABLE \`demande-user\` ADD \`comment\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` ADD \`comment\` text NULL`);

        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
