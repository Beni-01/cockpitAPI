import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDSATVI1779196200000 implements MigrationInterface {
  name = 'ADDSATVI1779196200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`satvi_questionnaire\` (
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` datetime(6) NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`reference_code\` varchar(50) NULL,
        \`direction_metier\` varchar(150) NOT NULL,
        \`province_visitee\` varchar(150) NOT NULL,
        \`periode_du\` date NOT NULL,
        \`periode_au\` date NOT NULL,
        \`type_mission\` enum ('suivi', 'appui_technique', 'controle', 'autre') NOT NULL,
        \`type_mission_autre\` varchar(150) NULL,
        \`evaluation\` json NOT NULL,
        \`evaluation_total\` int NOT NULL DEFAULT '0',
        \`evaluation_count\` int NOT NULL DEFAULT '15',
        \`evaluation_average\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`appreciation_globale\` tinyint NOT NULL,
        \`score_global\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`points_forts\` text NULL,
        \`faiblesses_observees\` text NULL,
        \`recommandations\` text NULL,
        \`dysfonctionnement_majeur\` tinyint NOT NULL DEFAULT 0,
        \`description_dysfonctionnement\` text NULL,
        \`status\` enum ('brouillon', 'soumis', 'archive') NOT NULL DEFAULT 'soumis',
        \`submitted_at\` datetime NULL,
        \`ip_address\` varchar(80) NULL,
        \`user_agent\` varchar(500) NULL,
        UNIQUE INDEX \`IDX_satvi_reference_code\` (\`reference_code\`),
        INDEX \`IDX_satvi_province_visitee\` (\`province_visitee\`),
        INDEX \`IDX_satvi_direction_metier\` (\`direction_metier\`),
        INDEX \`IDX_satvi_type_mission\` (\`type_mission\`),
        INDEX \`IDX_satvi_status\` (\`status\`),
        INDEX \`IDX_satvi_periode\` (\`periode_du\`, \`periode_au\`),
        INDEX \`IDX_satvi_dysfonctionnement\` (\`dysfonctionnement_majeur\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `satvi_questionnaire`');
  }
}
