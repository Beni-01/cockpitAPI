import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDTRESORERIE1776889868574 implements MigrationInterface {
    name = 'ADDTRESORERIE1776889868574'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE \`tresorerie_mouvement\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Identifiant unique du mouvement de trésorerie', \`date_operation\` date NOT NULL COMMENT 'Date de réalisation du mouvement', \`type_mouvement\` enum ('entree', 'sortie') NOT NULL COMMENT 'Type de mouvement : entrée ou sortie', \`coordination\` varchar(150) NOT NULL COMMENT 'Coordination provinciale concernée (ex: Nord-Kivu, Haut-Katanga)', \`motif\` varchar(255) NOT NULL COMMENT 'Motif ou libellé du mouvement (ex: Frais de communication)', \`reference_fed\` varchar(100) NULL COMMENT 'Référence FED unique (ex: FED-DEP-2026-04-009)', \`beneficiaire\` varchar(200) NULL COMMENT 'Bénéficiaire du mouvement (nom fournisseur, personne, etc.)', \`montant\` decimal(20,2) NOT NULL COMMENT 'Montant du mouvement en Francs Congolais (FC)', \`solde_apres\` decimal(20,2) NULL COMMENT 'Solde de la caisse après le mouvement', \`devise\` varchar(10) NOT NULL COMMENT 'Devise utilisée (FC par défaut)' DEFAULT 'FC', \`agent_saisi\` varchar(150) NULL COMMENT 'Nom de l''agent ayant saisi le mouvement', \`observation\` text NULL COMMENT 'Observation ou commentaire libre', INDEX \`IDX_d7ae8247c7ac10c50091792ecf\` (\`type_mouvement\`), INDEX \`IDX_9d2f20a676fe88b534da0d5597\` (\`date_operation\`), INDEX \`IDX_9f3be7692224ae5294fc9e3bbb\` (\`coordination\`), UNIQUE INDEX \`IDX_79f669ec4acf6173ca9bc7fcdf\` (\`reference_fed\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
      
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      
    }

}
