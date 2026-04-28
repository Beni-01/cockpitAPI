import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDSTATUTTREZO1777372517379 implements MigrationInterface {
    name = 'ADDSTATUTTREZO1777372517379'

    public async up(queryRunner: QueryRunner): Promise<void> {
      
        
        await queryRunner.query(`ALTER TABLE \`tresorerie_mouvement\` ADD \`status\` varchar(20) NOT NULL COMMENT 'Statut du mouvement (ex: En attente, Approuvé, Rejeté)' DEFAULT 'En attente'`);
         
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
     
    }

}
