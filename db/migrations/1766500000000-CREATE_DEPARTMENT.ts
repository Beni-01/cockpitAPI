import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CREATEDEPARTMENT1766500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'department',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'mapping_cash_flow', type: 'varchar', length: '255', isNullable: true },
          { name: 'departement_direction', type: 'varchar', length: '255', isNullable: true },
          { name: 'activites', type: 'varchar', length: '255', isNullable: true },
          { name: 'sous_activites', type: 'varchar', length: '255', isNullable: true },
          { name: 'taches', type: 'varchar', length: '255', isNullable: true },
          { name: 'code_departement', type: 'varchar', length: '255', isNullable: true },
          { name: 'code_activite', type: 'varchar', length: '255', isNullable: true },
          { name: 'code_sous_activite', type: 'varchar', length: '255', isNullable: true },
          { name: 'code_tache', type: 'varchar', length: '255', isNullable: true },
          { name: 'cost_code', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'datetime', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('department', true);
  }
}
