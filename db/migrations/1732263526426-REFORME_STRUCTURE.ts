import { MigrationInterface, QueryRunner } from "typeorm";

export class REFORMESTRUCTURE1732263526426 implements MigrationInterface {
    name = 'REFORMESTRUCTURE1732263526426'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`livrable\` \`livrableId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`livrable\` \`livrableId\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE TABLE \`livrable\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`livrable\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`status\` varchar(255) NULL DEFAULT 'En attente', \`responsable\` varchar(255) NULL, \`dateLivraisonAttendue\` varchar(255) NULL, \`dateLivraisonReelle\` varchar(255) NULL, \`support\` varchar(255) NULL, \`dateValidationAttendue\` varchar(255) NULL, \`dateValidationReel\` varchar(255) NULL, \`commentaire\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`livrableId\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`livrableId\` int NULL`);

        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`livrableId\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`livrableId\` int NULL`);

        await queryRunner.query(`ALTER TABLE \`activity\` ADD UNIQUE INDEX \`IDX_c3dd9f7a5f6f90c5d1b3087fb4\` (\`livrableId\`)`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD UNIQUE INDEX \`IDX_19938e31a1e6e78edfa60d5288\` (\`livrableId\`)`);
        


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
