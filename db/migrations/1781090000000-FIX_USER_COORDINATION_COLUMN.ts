import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class FIXUSERCOORDINATIONCOLUMN1781090000000 implements MigrationInterface {
    name = 'FIXUSERCOORDINATIONCOLUMN1781090000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists and add it if it doesn't
        const table = await queryRunner.getTable("user");
        const hasColumn = table?.columns.find(col => col.name === 'coordinationId');
        
        if (!hasColumn) {
            await queryRunner.addColumn(
                "user",
                new TableColumn({
                    name: "coordinationId",
                    type: "int",
                    isNullable: true,
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "coordinationId");
    }

}
