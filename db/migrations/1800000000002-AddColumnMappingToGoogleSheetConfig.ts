import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnMappingToGoogleSheetConfig1800000000002
  implements MigrationInterface
{
  name = 'AddColumnMappingToGoogleSheetConfig1800000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasColumn('google_sheet_config', 'column_mapping');
    if (!has) {
      await queryRunner.query(
        'ALTER TABLE `google_sheet_config` ADD COLUMN `column_mapping` JSON NULL;',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasColumn('google_sheet_config', 'column_mapping');
    if (has) {
      await queryRunner.query(
        'ALTER TABLE `google_sheet_config` DROP COLUMN `column_mapping`;',
      );
    }
  }
}
