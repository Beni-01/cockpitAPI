import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsePollingToGoogleSheetConfig1800000000001
  implements MigrationInterface
{
  name = 'AddUsePollingToGoogleSheetConfig1800000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasColumn('google_sheet_config', 'use_polling');
    if (!has) {
      await queryRunner.query(
        'ALTER TABLE `google_sheet_config` ADD COLUMN `use_polling` TINYINT(1) NOT NULL DEFAULT 0;',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasColumn('google_sheet_config', 'use_polling');
    if (has) {
      await queryRunner.query(
        'ALTER TABLE `google_sheet_config` DROP COLUMN `use_polling`;',
      );
    }
  }
}
