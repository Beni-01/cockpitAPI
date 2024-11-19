import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDANNOTATION1732038784688 implements MigrationInterface {
    name = 'ADDANNOTATION1732038784688'

    public async up(queryRunner: QueryRunner): Promise<void> {
     
        
        await queryRunner.query(`CREATE TABLE \`annotationActivity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NULL DEFAULT 'COMMENTAIRE', \`text\` text NOT NULL, \`activityId\` int NOT NULL, \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
