import { MigrationInterface, QueryRunner } from 'typeorm';

export class UPDATESATVIQUESTIONS1779360000000 implements MigrationInterface {
  name = 'UPDATESATVIQUESTIONS1779360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      ADD \`aspect_accueil_ameliorer\` text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      ADD \`difficulte_organisationnelle\` text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      ADD \`amelioration_collaboration_terrain\` text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      ADD \`question_count\` int NOT NULL DEFAULT 19
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      ALTER \`evaluation_count\` SET DEFAULT 14
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      ALTER \`evaluation_count\` SET DEFAULT 15
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      DROP COLUMN \`question_count\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      DROP COLUMN \`amelioration_collaboration_terrain\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      DROP COLUMN \`difficulte_organisationnelle\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`satvi_questionnaire\`
      DROP COLUMN \`aspect_accueil_ameliorer\`
    `);
  }
}
