import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRangeToGoogleSheetConfig1766390000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const has = await queryRunner.hasColumn('google_sheet_config', 'range');
        if (!has) {
            await queryRunner.query("ALTER TABLE `google_sheet_config` ADD COLUMN `range` VARCHAR(255) NULL;");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const has = await queryRunner.hasColumn('google_sheet_config', 'range');
        if (has) {
            await queryRunner.query("ALTER TABLE `google_sheet_config` DROP COLUMN `range`;");
        }
    }
}
