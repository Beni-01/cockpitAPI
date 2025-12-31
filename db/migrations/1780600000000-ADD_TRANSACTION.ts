import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDTRANSACTION1780600000000 implements MigrationInterface {
    name = 'ADDTRANSACTION1780600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Identifiant unique de la transaction', \`depense\` decimal(20,2) NULL COMMENT 'Montant réel de la dépense après ajustements ou conversions (Toujours en USD)', \`devise\` varchar(255) NOT NULL COMMENT 'Devise d’origine de la transaction (ex: USD, CDF, EUR)' DEFAULT 'USD', \`depense_init\` decimal(20,2) NULL COMMENT 'Montant initial de la dépense avant conversion', \`devise_convert\` varchar(255) NOT NULL COMMENT 'Devise après conversion si applicable' DEFAULT 'USD', \`description\` text NULL COMMENT 'Description détaillée de la transaction', \`ref\` varchar(255) NULL COMMENT 'Référence externe ou interne de la transaction', \`agent\` varchar(255) NULL COMMENT 'Nom de l’agent ayant effectué la transaction', \`centreId\` int NULL COMMENT 'Identifiant du centre budgétaire lié à la transaction', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_ffac93b028640b52690ba9252b7\` FOREIGN KEY (\`centreId\`) REFERENCES \`budget\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
