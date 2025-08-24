import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDPASSATIONMARCHE1748949014861 implements MigrationInterface {
    name = 'ADDPASSATIONMARCHE1748949014861'

    public async up(queryRunner: QueryRunner): Promise<void> {
 
        await queryRunner.query(`CREATE TABLE \`passation_marche\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`intitule\` varchar(255) NOT NULL, \`service\` varchar(100) NOT NULL, \`montant\` decimal(15,2) NOT NULL, \`type_marche\` varchar(50) NOT NULL, \`mode_passation\` varchar(50) NOT NULL, \`deadline\` varchar(50) NOT NULL, \`as_tdr\` tinyint NULL, \`as_amidao\` tinyint NULL, \`as_ano\` tinyint NULL, \`as_public\` tinyint NULL, \`as_depot\` tinyint NULL, \`sub_commission_analyse\` tinyint NULL, \`commission_pm\` tinyint NULL, \`demande_proposition\` tinyint NULL, \`depot_proposition_tech\` tinyint NULL, \`analyse_technique\` tinyint NULL, \`analyse_proposition_fin\` tinyint NULL, \`analyse_combinee\` tinyint NULL, \`notification\` tinyint NULL, \`publication_2\` tinyint NULL, \`ano_rapport_analyse\` tinyint NULL, \`mise_point_contrat\` tinyint NULL, \`approbation_tutelle_pm\` tinyint NULL, \`notification_definitive\` tinyint NULL, \`observations\` text NULL, \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      
    }

}
