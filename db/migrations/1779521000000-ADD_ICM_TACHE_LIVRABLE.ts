import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDICMTACHELIVRABLE1779521000000 implements MigrationInterface {
  name = 'ADDICMTACHELIVRABLE1779521000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`icm_tache_livrable\` (
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` datetime(6) NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`tacheId\` int NOT NULL,
        \`coordinationId\` int NOT NULL,
        \`status\` enum(
          'NON_SOUMIS',
          'SOUMIS',
          'VALIDE',
          'RETOURNE'
        ) NOT NULL DEFAULT 'SOUMIS',
        \`nomFichier\` varchar(255) NOT NULL,
        \`urlFichier\` varchar(1000) NOT NULL,
        \`commentaire\` text NULL,
        \`soumisPar\` int NULL,
        \`soumisLe\` datetime NOT NULL,
        \`traitePar\` int NULL,
        \`traiteLe\` datetime NULL,
        \`motifRetour\` text NULL,
        UNIQUE INDEX \`IDX_icm_tache_livrable_tache_coordination\` (
          \`tacheId\`,
          \`coordinationId\`
        ),
        INDEX \`IDX_icm_tache_livrable_status\` (\`status\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`icm_tache_livrable\`
      ADD CONSTRAINT \`FK_icm_tache_livrable_tache\`
      FOREIGN KEY (\`tacheId\`) REFERENCES \`icm_tache\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`icm_tache_livrable\`
      ADD CONSTRAINT \`FK_icm_tache_livrable_coordination\`
      FOREIGN KEY (\`coordinationId\`) REFERENCES \`coordination\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`icm_tache_livrable\`
      ADD CONSTRAINT \`FK_icm_tache_livrable_soumissionnaire\`
      FOREIGN KEY (\`soumisPar\`) REFERENCES \`user\`(\`id\`)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`icm_tache_livrable\`
      ADD CONSTRAINT \`FK_icm_tache_livrable_validateur\`
      FOREIGN KEY (\`traitePar\`) REFERENCES \`user\`(\`id\`)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `icm_tache_livrable` DROP FOREIGN KEY `FK_icm_tache_livrable_validateur`',
    );
    await queryRunner.query(
      'ALTER TABLE `icm_tache_livrable` DROP FOREIGN KEY `FK_icm_tache_livrable_soumissionnaire`',
    );
    await queryRunner.query(
      'ALTER TABLE `icm_tache_livrable` DROP FOREIGN KEY `FK_icm_tache_livrable_coordination`',
    );
    await queryRunner.query(
      'ALTER TABLE `icm_tache_livrable` DROP FOREIGN KEY `FK_icm_tache_livrable_tache`',
    );
    await queryRunner.query('DROP TABLE `icm_tache_livrable`');
  }
}
