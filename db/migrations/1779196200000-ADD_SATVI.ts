import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDSATVI1779196200000 implements MigrationInterface {
  name = 'ADDSATVI1779196200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`satvi_mission\` (
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` datetime(6) NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`reference_code\` varchar(50) NOT NULL,
        \`titre\` varchar(180) NOT NULL,
        \`description\` text NULL,
        \`date_debut\` date NOT NULL,
        \`date_fin\` date NOT NULL,
        \`coordination_id\` int NOT NULL,
        \`province\` varchar(150) NOT NULL,
        \`coordination_nom\` varchar(180) NOT NULL,
        \`type_mission\` varchar(50) NOT NULL,
        \`type_mission_autre\` varchar(150) NULL,
        \`status\` varchar(30) NOT NULL DEFAULT 'active',
        \`created_by\` int NULL,
        \`sent_at\` datetime NULL,
        UNIQUE INDEX \`IDX_satvi_mission_reference\` (\`reference_code\`),
        INDEX \`IDX_satvi_mission_coordination\` (\`coordination_id\`),
        INDEX \`IDX_satvi_mission_status\` (\`status\`),
        INDEX \`IDX_satvi_mission_dates\` (\`date_debut\`, \`date_fin\`),
        INDEX \`IDX_satvi_mission_type\` (\`type_mission\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`satvi_mission_invitation\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`mission_id\` int NOT NULL,
        \`user_id\` int NULL,
        \`nom_complet\` varchar(220) NOT NULL,
        \`email\` varchar(180) NULL,
        \`direction\` varchar(180) NULL,
        \`token\` varchar(120) NOT NULL,
        \`invitation_link\` varchar(500) NOT NULL,
        \`status\` varchar(30) NOT NULL DEFAULT 'preparee',
        \`sent_at\` datetime NULL,
        \`used_at\` datetime NULL,
        \`send_error\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_satvi_invitation_token\` (\`token\`),
        INDEX \`IDX_satvi_invitation_mission\` (\`mission_id\`),
        INDEX \`IDX_satvi_invitation_user\` (\`user_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`satvi_questionnaire\` (
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` datetime(6) NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`reference_code\` varchar(50) NULL,
        \`mission_id\` int NULL,
        \`direction_metier\` varchar(150) NOT NULL,
        \`province_visitee\` varchar(150) NOT NULL,
        \`periode_du\` date NOT NULL,
        \`periode_au\` date NOT NULL,
        \`type_mission\` varchar(50) NOT NULL,
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
        \`status\` varchar(30) NOT NULL DEFAULT 'soumis',
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
        INDEX \`IDX_satvi_questionnaire_mission\` (\`mission_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`satvi_mission\`
      ADD CONSTRAINT \`FK_satvi_mission_coordination\`
      FOREIGN KEY (\`coordination_id\`) REFERENCES \`coordination\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_mission_invitation\`
      ADD CONSTRAINT \`FK_satvi_invitation_mission\`
      FOREIGN KEY (\`mission_id\`) REFERENCES \`satvi_mission\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_mission_invitation\`
      ADD CONSTRAINT \`FK_satvi_invitation_user\`
      FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      ADD CONSTRAINT \`FK_satvi_questionnaire_mission\`
      FOREIGN KEY (\`mission_id\`) REFERENCES \`satvi_mission\`(\`id\`)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `satvi_questionnaire` DROP FOREIGN KEY `FK_satvi_questionnaire_mission`');
    await queryRunner.query('ALTER TABLE `satvi_mission_invitation` DROP FOREIGN KEY `FK_satvi_invitation_user`');
    await queryRunner.query('ALTER TABLE `satvi_mission_invitation` DROP FOREIGN KEY `FK_satvi_invitation_mission`');
    await queryRunner.query('ALTER TABLE `satvi_mission` DROP FOREIGN KEY `FK_satvi_mission_coordination`');
    await queryRunner.query('DROP TABLE `satvi_questionnaire`');
    await queryRunner.query('DROP TABLE `satvi_mission_invitation`');
    await queryRunner.query('DROP TABLE `satvi_mission`');
  }
}
