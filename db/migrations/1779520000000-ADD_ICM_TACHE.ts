import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDICMTACHE1779520000000 implements MigrationInterface {
  name = 'ADDICMTACHE1779520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`icm_tache\` (
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` datetime(6) NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`domaine\` varchar(150) NOT NULL,
        \`tacheManageriale\` varchar(500) NOT NULL,
        \`description\` text NULL,
        \`livrableAttendu\` varchar(255) NOT NULL,
        \`periodicite\` enum(
          'Journalier',
          'Hebdomadaire',
          'Mensuel',
          'Trimestriel',
          'Semestriel',
          'Annuel'
        ) NOT NULL,
        \`dateDebut\` date NOT NULL,
        \`dateLimite\` date NOT NULL,
        \`porteeAssignation\` enum(
          'ALL_PROVINCES',
          'SPECIFIC_PROVINCES'
        ) NOT NULL DEFAULT 'ALL_PROVINCES',
        \`provincesAssignees\` json NULL,
        \`instructionsSpecifiques\` text NULL,
        \`ordre\` int NOT NULL DEFAULT 1,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        INDEX \`IDX_icm_tache_domaine_active\` (\`domaine\`, \`isActive\`),
        INDEX \`IDX_icm_tache_periodicite_active\` (\`periodicite\`, \`isActive\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `icm_tache`');
  }
}
