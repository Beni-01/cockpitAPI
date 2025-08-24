import { MigrationInterface, QueryRunner } from "typeorm";

export class HOTMIGRATION31738596872218 implements MigrationInterface {
    name = 'HOTMIGRATION31738596872218'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`titre\` \`titre\` text NOT NULL`);
    
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`resultat\` \`resultat\` text NOT NULL`);

        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE  \`indicateur\` \`indicateur\` text NULL`);

        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`resultatObtenu\` \`resultatObtenu\` text NULL`);

        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
