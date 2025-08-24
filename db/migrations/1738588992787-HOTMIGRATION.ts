import { MigrationInterface, QueryRunner } from "typeorm";

export class HOTMIGRATION1738588992787 implements MigrationInterface {
    name = 'HOTMIGRATION1738588992787'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`debut\` \`debut\` varchar(255) NULL`);

        // Change the fin column type and nullability
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`fin\` \`fin\` varchar(255) NULL`);

        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      
    }

}
