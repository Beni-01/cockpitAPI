import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCategoryIdToDepartment1800000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add categoryId column to department table if it does not exist
    const hasColumn = await queryRunner.hasColumn('department', 'categoryId');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'department',
        new TableColumn({
          name: 'categoryId',
          type: 'int',
          isNullable: true,
        })
      );

      // Add foreign key constraint
      await queryRunner.createForeignKey(
        'department',
        new TableForeignKey({
          columnNames: ['categoryId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'category',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key and column only if they exist
    const hasColumn = await queryRunner.hasColumn('department', 'categoryId');
    if (hasColumn) {
      const table = await queryRunner.getTable('department');
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('categoryId') !== -1
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('department', foreignKey);
      }

      // Drop the column
      await queryRunner.dropColumn('department', 'categoryId');
    }
  }
}
