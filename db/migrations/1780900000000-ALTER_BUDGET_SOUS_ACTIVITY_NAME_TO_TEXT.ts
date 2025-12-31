import { MigrationInterface, QueryRunner } from 'typeorm';

export class ALTERBUDGETSOUSACTIVITYNAMETOTEXT1780900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `budget_sous_activity` MODIFY `name` TEXT NULL");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `budget_sous_activity` MODIFY `name` varchar(255) NULL");
  }
}
