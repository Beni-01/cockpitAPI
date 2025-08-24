import { MigrationInterface, QueryRunner } from "typeorm";

export class RESTRUCTUREPASSATIONTRUNCATE1748967197536 implements MigrationInterface {
    name = 'RESTRUCTUREPASSATIONTRUNCATE1748967197536'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`as_tdr\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`as_tdr\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`as_amidao\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`as_amidao\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`as_ano\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`as_ano\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`as_public\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`as_public\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`as_depot\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`as_depot\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`sub_commission_analyse\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`sub_commission_analyse\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`commission_pm\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`commission_pm\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`demande_proposition\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`demande_proposition\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`depot_proposition_tech\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`depot_proposition_tech\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`analyse_technique\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`analyse_technique\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`analyse_proposition_fin\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`analyse_proposition_fin\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`analyse_combinee\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`analyse_combinee\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`notification\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`notification\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`publication_2\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`publication_2\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`ano_rapport_analyse\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`ano_rapport_analyse\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`mise_point_contrat\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`mise_point_contrat\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`approbation_tutelle_pm\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`approbation_tutelle_pm\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` DROP COLUMN \`notification_definitive\``);
        await queryRunner.query(`ALTER TABLE \`passation_marche\` ADD \`notification_definitive\` varchar(255) NULL`);
        await queryRunner.query(`TRUNCATE TABLE \`passation_marche\` `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
