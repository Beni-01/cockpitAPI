import { MigrationInterface, QueryRunner } from 'typeorm';

export class ALTERDEPARTMENTSOUSACTIVITESTOTEXT1766600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `department` MODIFY `sous_activites` TEXT NULL");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `department` MODIFY `sous_activites` varchar(255) NULL");
  }
}
