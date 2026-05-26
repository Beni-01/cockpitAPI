import { MigrationInterface, QueryRunner } from "typeorm";

export class MODIFTYPEMISSION1779441710572 implements MigrationInterface {
    name = 'MODIFTYPEMISSION1779441710572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`satvi_mission\` ADD \`direction\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`satvi_mission\` DROP COLUMN \`direction\``);
    }

}
