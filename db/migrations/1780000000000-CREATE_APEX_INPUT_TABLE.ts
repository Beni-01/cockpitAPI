import { MigrationInterface, QueryRunner } from 'typeorm';

export class CREATEAPEXINPUTTABLE1780000000000 implements MigrationInterface {
  name = 'CREATEAPEXINPUTTABLE1780000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE ` + "`apex_input`" + ` (
      ` + "`id`" + ` int NOT NULL AUTO_INCREMENT,
      ` + "`cost_center`" + ` varchar(255) DEFAULT NULL,
      ` + "`description_cc`" + ` text DEFAULT NULL,
      ` + "`province_ville`" + ` varchar(255) DEFAULT NULL,
      ` + "`coordinations_provinciales`" + ` varchar(255) DEFAULT NULL,
      ` + "`local_etranger`" + ` varchar(100) DEFAULT NULL,
      ` + "`categorie_grade`" + ` varchar(255) DEFAULT NULL,
      ` + "`nature_depenses`" + ` varchar(255) DEFAULT NULL,
      ` + "`account_ohada`" + ` varchar(255) DEFAULT NULL,
      ` + "`departement`" + ` varchar(255) DEFAULT NULL,
      ` + "`texte_libelle`" + ` text DEFAULT NULL,
      ` + "`cout_unitaire_auto`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`unite_de_mesure`" + ` varchar(100) DEFAULT NULL,
      ` + "`cout_unitaire_manuel`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`jan`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`feb`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`mar`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`apr`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`may`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`jun`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`jul`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`aug`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`sep`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`oct`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`nov`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`dec`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`total_units`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`total_budget_usd`" + ` decimal(20,2) DEFAULT NULL,
      ` + "`department_id`" + ` int DEFAULT NULL,
      ` + "`mapping_cash_flow_id`" + ` int DEFAULT NULL,
      ` + "`activity_id`" + ` int DEFAULT NULL,
      ` + "`sous_activity_id`" + ` int DEFAULT NULL,
      ` + "`tache_id`" + ` int DEFAULT NULL,
      ` + "`created_at`" + ` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ` + "`updated_at`" + ` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (` + "`id`" + `)
    ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE ` + "`apex_input`");
  }

}
