import { MigrationInterface, QueryRunner } from 'typeorm';

export class ALTERDEPARTMENTTEXTCOLUMNS1766700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `department` MODIFY `mapping_cash_flow` TEXT NULL");
    await queryRunner.query("ALTER TABLE `department` MODIFY `departement_direction` TEXT NULL");
    await queryRunner.query("ALTER TABLE `department` MODIFY `activites` TEXT NULL");
    await queryRunner.query("ALTER TABLE `department` MODIFY `taches` TEXT NULL");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `department` MODIFY `mapping_cash_flow` varchar(255) NULL");
    await queryRunner.query("ALTER TABLE `department` MODIFY `departement_direction` varchar(255) NULL");
    await queryRunner.query("ALTER TABLE `department` MODIFY `activites` varchar(255) NULL");
    await queryRunner.query("ALTER TABLE `department` MODIFY `taches` varchar(255) NULL");
  }
}
