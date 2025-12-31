import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CREATEGOOGLESHEETCONFIG1766389999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'google_sheet_config',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'sheet_url', type: 'text' },
          { name: 'sheet_id', type: 'varchar', length: '255' },
          { name: 'worksheet_name', type: 'varchar', length: '255', default: "'Sheet1'" },
          { name: 'range', type: 'varchar', length: '255', isNullable: true },
          { name: 'auth_type', type: 'enum', enum: ['oauth','service_account'], default: "'oauth'" },
          { name: 'credentials_encrypted', type: 'text', isNullable: true },
          { name: 'is_active', type: 'tinyint', width: 1, default: '1' },
          { name: 'use_polling', type: 'tinyint', width: 1, default: '0' },
          { name: 'last_sync_at', type: 'datetime', isNullable: true },
          { name: 'lastSyncStatus', type: 'varchar', length: '50', isNullable: true },
          { name: 'lastSyncMessage', type: 'text', isNullable: true },
          { name: 'columnMapping', type: 'json', isNullable: true },
          { name: 'created_by', type: 'int' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // add foreign key to user if user table exists
    const hasUser = await queryRunner.hasTable('user');
    if (hasUser) {
      await queryRunner.createForeignKey(
        'google_sheet_config',
        new TableForeignKey({
          columnNames: ['created_by'],
          referencedTableName: 'user',
          referencedColumnNames: ['id'],
          onDelete: 'NO ACTION',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('google_sheet_config');
    if (table) {
      const fk = table.foreignKeys.find((f) => f.columnNames.indexOf('created_by') !== -1);
      if (fk) await queryRunner.dropForeignKey('google_sheet_config', fk);
    }
    await queryRunner.dropTable('google_sheet_config', true);
  }
}
