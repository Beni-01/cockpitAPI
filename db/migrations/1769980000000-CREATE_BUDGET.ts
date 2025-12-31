import { MigrationInterface, QueryRunner } from "typeorm";

export class CREATEBUDGET1769980000000 implements MigrationInterface {
    name = 'CREATEBUDGET1769980000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE `budget` (\n" +
            "  `id` int NOT NULL AUTO_INCREMENT,\n" +
            "  `cost_center` varchar(255) NULL,\n" +
            "  `description_cc` text NULL,\n" +
            "  `province_ville` varchar(255) NULL,\n" +
            "  `coordinations_provinciales` text NULL,\n" +
            "  `local_etranger` varchar(100) NULL,\n" +
            "  `categorie_grade` varchar(255) NULL,\n" +
            "  `nature_depenses` text NULL,\n" +
            "  `account_ohada` varchar(255) NULL,\n" +
            "  `departement` varchar(255) NULL,\n" +
            "  `texte_libelle` text NULL,\n" +
            "  `unite_mesure` varchar(255) NULL,\n" +
            "  `cout_unitaire_usd` decimal(15,2) NULL,\n" +
            "  `jan` decimal(15,2) NULL,\n" +
            "  `feb` decimal(15,2) NULL,\n" +
            "  `mar` decimal(15,2) NULL,\n" +
            "  `apr` decimal(15,2) NULL,\n" +
            "  `may` decimal(15,2) NULL,\n" +
            "  `jun` decimal(15,2) NULL,\n" +
            "  `jul` decimal(15,2) NULL,\n" +
            "  `aug` decimal(15,2) NULL,\n" +
            "  `sep` decimal(15,2) NULL,\n" +
            "  `oct` decimal(15,2) NULL,\n" +
            "  `nov` decimal(15,2) NULL,\n" +
            "  `dec` decimal(15,2) NULL,\n" +
            "  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),\n" +
            "  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),\n" +
            "  `deleted_at` datetime(6) NULL,\n" +
            "  PRIMARY KEY (`id`)\n" +
            ") ENGINE=InnoDB"
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE ` + "`budget`");
    }

}
