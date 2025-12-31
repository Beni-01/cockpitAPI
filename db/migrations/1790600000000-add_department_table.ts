import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentTable1790600000000 implements MigrationInterface {
    name = 'AddDepartmentTable1790600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_activity_mapping_cash_flow\``);
            await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_budget_activity\``);
            await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_budget_department\``);
            await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_budget_mapping_cash_flow\``);
            await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_budget_sous_activity\``);
            await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_budget_tache\``);
            await queryRunner.query(`ALTER TABLE \`budget_tache\` DROP FOREIGN KEY \`FK_budget_tache_sous_activity\``);
            await queryRunner.query(`ALTER TABLE \`budget_sous_activity\` DROP FOREIGN KEY \`FK_budget_sous_activity_activity\``);
            await queryRunner.query(`ALTER TABLE \`budget_activity\` DROP FOREIGN KEY \`FK_budget_activity_category\``);
            await queryRunner.query(`ALTER TABLE \`budget_activity\` DROP FOREIGN KEY \`FK_budget_activity_mapping\``);
            await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` DROP FOREIGN KEY \`FK_mapping_cash_flow_category\``);
        } catch (e) {
            // ignore if FK does not exist
        }
        try {
            await queryRunner.query(`DROP INDEX \`IDX_19938e31a1e6e78edfa60d5288\` ON \`sousActivity\``);
            await queryRunner.query(`DROP INDEX \`IDX_c3dd9f7a5f6f90c5d1b3087fb4\` ON \`activity\``);
            await queryRunner.query(`DROP INDEX \`IDX_budget_department_id\` ON \`budget\``);
        } catch (e) {
            // ignore if index does not exist
        }
        await queryRunner.query(`ALTER TABLE \`budget_activity\` CHANGE \`category_id\` \`department_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` CHANGE \`category_id\` \`department_id\` int NULL`);
        await queryRunner.query(`CREATE TABLE \`google_sheet_webhook_config\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NOT NULL, \`webhook_url\` varchar(500) NOT NULL, \`webhook_secret\` varchar(255) NOT NULL, \`apps_script_installed\` tinyint NOT NULL DEFAULT 0, \`last_webhook_received\` timestamp NULL, \`webhook_status\` enum ('active', 'inactive', 'error') NOT NULL DEFAULT 'inactive', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sync_snapshots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NOT NULL, \`sync_log_id\` int NULL, \`snapshot_data\` longtext NOT NULL, \`record_count\` int NOT NULL DEFAULT '0', \`snapshot_hash\` varchar(64) NULL, \`description\` text NULL, \`snapshot_type\` enum ('pre_sync', 'post_sync', 'manual') NOT NULL DEFAULT 'pre_sync', \`created_by\` varchar(100) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expires_at\` timestamp NULL, \`is_restored\` tinyint NOT NULL DEFAULT 0, \`restored_at\` timestamp NULL, INDEX \`IDX_637a27f2759e258a7f197e9152\` (\`config_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`google_sheet_sync_schedule\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NOT NULL, \`sync_type\` enum ('webhook', 'polling') NOT NULL DEFAULT 'webhook', \`frequency\` enum ('1min', '5min', '15min', '30min', '1hour') NULL, \`cron_expression\` varchar(100) NULL, \`is_enabled\` tinyint NOT NULL DEFAULT 0, \`last_sync_at\` timestamp NULL, \`next_sync_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`google_sheet_sync_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NOT NULL, \`trigger_source\` enum ('webhook', 'polling', 'initial') NOT NULL DEFAULT 'webhook', \`status\` enum ('pending', 'in_progress', 'success', 'failed') NOT NULL, \`records_fetched\` int NOT NULL DEFAULT '0', \`records_inserted\` int NOT NULL DEFAULT '0', \`records_updated\` int NOT NULL DEFAULT '0', \`records_skipped\` int NOT NULL DEFAULT '0', \`error_message\` text NULL, \`started_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`completed_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`google_sheet_column_mapping\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NOT NULL, \`sheet_column_name\` varchar(255) NOT NULL, \`db_field_name\` varchar(255) NOT NULL, \`data_type\` enum ('string', 'number', 'date', 'boolean') NOT NULL DEFAULT 'string', \`is_required\` tinyint NOT NULL DEFAULT 0, \`default_value\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budget_data\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NULL, \`department_name\` varchar(255) NULL, \`external_id\` varchar(255) NULL, \`project_name\` varchar(255) NULL, \`budget_category\` varchar(255) NULL, \`cost_center\` varchar(255) NULL, \`account_code\` varchar(100) NULL, \`allocated_amount\` decimal(15,2) NULL, \`spent_amount\` decimal(15,2) NOT NULL DEFAULT '0.00', \`remaining_amount\` decimal(15,2) NULL, \`budget_type\` enum ('OPEX', 'CAPEX', 'Mixed') NOT NULL DEFAULT 'OPEX', \`budget_period\` varchar(100) NULL, \`fiscal_year\` int NULL, \`quarter\` int NULL, \`month\` int NULL, \`start_date\` date NULL, \`end_date\` date NULL, \`status\` enum ('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active', \`approval_status\` enum ('draft', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'draft', \`notes\` text NULL, \`responsible_person\` varchar(255) NULL, \`province\` varchar(255) NULL, \`territory\` varchar(255) NULL, \`synced_from_sheet\` tinyint NOT NULL DEFAULT 1, \`last_synced_at\` timestamp NULL, \`sync_hash\` varchar(64) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_09b5e57d4895ace88b0451f1fb\` (\`config_id\`), INDEX \`IDX_549413ce5bca021ad3a34b3225\` (\`department_name\`), INDEX \`IDX_be86d0e7b8acf75bf3368aa8e9\` (\`external_id\`), INDEX \`IDX_a79fb67dab3a62f8ba716a743e\` (\`project_name\`), INDEX \`IDX_428ec0a471b38696df19f10ce0\` (\`budget_type\`), INDEX \`IDX_2563faf321da237126c482255e\` (\`fiscal_year\`), INDEX \`IDX_a571f60387d2bdb4663f32ea96\` (\`status\`), INDEX \`IDX_e1464335244e5f89c2d6255c4e\` (\`approval_status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budget_data_change_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`budget_data_id\` int NOT NULL, \`config_id\` int NOT NULL, \`field_name\` varchar(100) NOT NULL, \`old_value\` text NULL, \`new_value\` text NULL, \`changed_by\` varchar(100) NOT NULL DEFAULT 'sync', \`changed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`sync_log_id\` int NULL, INDEX \`IDX_bfa7425b2d679c9a80da691a34\` (\`budget_data_id\`), INDEX \`IDX_bc85d034d88a190d417eed1f91\` (\`config_id\`), INDEX \`IDX_4ccc019cb6a4fdbb48408b5320\` (\`field_name\`), INDEX \`IDX_05dafe63b4aef16ec0897d2441\` (\`changed_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`departments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(64) NOT NULL, \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_91fddbe23e927e1e525c152baa\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`department\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(64) NOT NULL, \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_62690f4fe31da9eb824d909285\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`mapping_cash_flow_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`signature\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP COLUMN \`z\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP COLUMN \`aa\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_60bc4dbcd1770ec0a6b689640a1\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`activityId\` \`activityId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`userId\` \`userId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`sexe\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`sexe\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`otp\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`otp\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` DROP COLUMN \`last_sync_at\``);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` ADD \`last_sync_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`activityId\` \`activityId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`userId\` \`userId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD UNIQUE INDEX \`IDX_19938e31a1e6e78edfa60d5288\` (\`livrableId\`)`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD UNIQUE INDEX \`IDX_c3dd9f7a5f6f90c5d1b3087fb4\` (\`livrableId\`)`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_19938e31a1e6e78edfa60d5288\` ON \`sousActivity\` (\`livrableId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_c3dd9f7a5f6f90c5d1b3087fb4\` ON \`activity\` (\`livrableId\`)`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_856efdd136dff1362f39e292a5d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_60bc4dbcd1770ec0a6b689640a1\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_19938e31a1e6e78edfa60d52881\` FOREIGN KEY (\`livrableId\`) REFERENCES \`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_c3dd9f7a5f6f90c5d1b3087fb49\` FOREIGN KEY (\`livrableId\`) REFERENCES \`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_webhook_config\` ADD CONSTRAINT \`FK_f9bfae6a2eedb2a262bf82f7d19\` FOREIGN KEY (\`config_id\`) REFERENCES \`google_sheet_config\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_sync_schedule\` ADD CONSTRAINT \`FK_fe333c8179a75f8bb2c7604f6ce\` FOREIGN KEY (\`config_id\`) REFERENCES \`google_sheet_config\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_sync_log\` ADD CONSTRAINT \`FK_633e75933eb9972420c0c98a423\` FOREIGN KEY (\`config_id\`) REFERENCES \`google_sheet_config\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_column_mapping\` ADD CONSTRAINT \`FK_49bc0d2cd5cf36e3a88fc5e00eb\` FOREIGN KEY (\`config_id\`) REFERENCES \`google_sheet_config\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_data\` ADD CONSTRAINT \`FK_09b5e57d4895ace88b0451f1fb7\` FOREIGN KEY (\`config_id\`) REFERENCES \`google_sheet_config\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_data_change_log\` ADD CONSTRAINT \`FK_bfa7425b2d679c9a80da691a343\` FOREIGN KEY (\`budget_data_id\`) REFERENCES \`budget_data\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_data_change_log\` ADD CONSTRAINT \`FK_bc85d034d88a190d417eed1f918\` FOREIGN KEY (\`config_id\`) REFERENCES \`google_sheet_config\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_7b94f2b67697dec5178aa373410\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_4fac9b6f7d22d5c5b14c3e8e94e\` FOREIGN KEY (\`mapping_cash_flow_id\`) REFERENCES \`mapping_cash_flow\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_ae43a8c5f77e6accddde05dd96b\` FOREIGN KEY (\`activity_id\`) REFERENCES \`budget_activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_544c5bbc8603ed7a6cc43d8fe16\` FOREIGN KEY (\`sous_activity_id\`) REFERENCES \`budget_sous_activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_5b42f1c179d51010c2612082adb\` FOREIGN KEY (\`tache_id\`) REFERENCES \`budget_tache\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_tache\` ADD CONSTRAINT \`FK_d3ef0c58c2ac3ae9f7771326733\` FOREIGN KEY (\`sous_activity_id\`) REFERENCES \`budget_sous_activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_sous_activity\` ADD CONSTRAINT \`FK_772f4ce0f6c8e99fd8f5d174a28\` FOREIGN KEY (\`activity_id\`) REFERENCES \`budget_activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_activity\` ADD CONSTRAINT \`FK_67879cd029aec934e24e4dd607a\` FOREIGN KEY (\`mapping_cash_flow_id\`) REFERENCES \`mapping_cash_flow\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_activity\` ADD CONSTRAINT \`FK_324e04e9bd0a003c625a257b704\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` ADD CONSTRAINT \`FK_074c1a3a245d20894cfcdb574a4\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` DROP FOREIGN KEY \`FK_074c1a3a245d20894cfcdb574a4\``);
        await queryRunner.query(`ALTER TABLE \`budget_activity\` DROP FOREIGN KEY \`FK_324e04e9bd0a003c625a257b704\``);
        await queryRunner.query(`ALTER TABLE \`budget_activity\` DROP FOREIGN KEY \`FK_67879cd029aec934e24e4dd607a\``);
        await queryRunner.query(`ALTER TABLE \`budget_sous_activity\` DROP FOREIGN KEY \`FK_772f4ce0f6c8e99fd8f5d174a28\``);
        await queryRunner.query(`ALTER TABLE \`budget_tache\` DROP FOREIGN KEY \`FK_d3ef0c58c2ac3ae9f7771326733\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_5b42f1c179d51010c2612082adb\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_544c5bbc8603ed7a6cc43d8fe16\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_ae43a8c5f77e6accddde05dd96b\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_4fac9b6f7d22d5c5b14c3e8e94e\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_7b94f2b67697dec5178aa373410\``);
        await queryRunner.query(`ALTER TABLE \`budget_data_change_log\` DROP FOREIGN KEY \`FK_bc85d034d88a190d417eed1f918\``);
        await queryRunner.query(`ALTER TABLE \`budget_data_change_log\` DROP FOREIGN KEY \`FK_bfa7425b2d679c9a80da691a343\``);
        await queryRunner.query(`ALTER TABLE \`budget_data\` DROP FOREIGN KEY \`FK_09b5e57d4895ace88b0451f1fb7\``);
        await queryRunner.query(`ALTER TABLE \`google_sheet_column_mapping\` DROP FOREIGN KEY \`FK_49bc0d2cd5cf36e3a88fc5e00eb\``);
        await queryRunner.query(`ALTER TABLE \`google_sheet_sync_log\` DROP FOREIGN KEY \`FK_633e75933eb9972420c0c98a423\``);
        await queryRunner.query(`ALTER TABLE \`google_sheet_sync_schedule\` DROP FOREIGN KEY \`FK_fe333c8179a75f8bb2c7604f6ce\``);
        await queryRunner.query(`ALTER TABLE \`google_sheet_webhook_config\` DROP FOREIGN KEY \`FK_f9bfae6a2eedb2a262bf82f7d19\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_c3dd9f7a5f6f90c5d1b3087fb49\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_19938e31a1e6e78edfa60d52881\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_60bc4dbcd1770ec0a6b689640a1\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`DROP INDEX \`REL_c3dd9f7a5f6f90c5d1b3087fb4\` ON \`activity\``);
        await queryRunner.query(`DROP INDEX \`REL_19938e31a1e6e78edfa60d5288\` ON \`sousActivity\``);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`created_at\` \`created_at\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP INDEX \`IDX_c3dd9f7a5f6f90c5d1b3087fb4\``);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP INDEX \`IDX_19938e31a1e6e78edfa60d5288\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`activityId\` \`activityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` CHANGE \`created_at\` \`created_at\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` DROP COLUMN \`last_sync_at\``);
        await queryRunner.query(`ALTER TABLE \`google_sheet_config\` ADD \`last_sync_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`otp\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`otp\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`sexe\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`sexe\` char(1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP INDEX \`IDX_c3dd9f7a5f6f90c5d1b3087fb4\``);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP INDEX \`IDX_19938e31a1e6e78edfa60d5288\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` CHANGE \`activityId\` \`activityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_856efdd136dff1362f39e292a5d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_60bc4dbcd1770ec0a6b689640a1\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD \`aa\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD \`z\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`signature\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`mapping_cash_flow_id\` int NULL`);
        await queryRunner.query(`DROP TABLE \`category\``);
        await queryRunner.query(`DROP INDEX \`IDX_62690f4fe31da9eb824d909285\` ON \`department\``);
        await queryRunner.query(`DROP TABLE \`department\``);
        await queryRunner.query(`DROP INDEX \`IDX_91fddbe23e927e1e525c152baa\` ON \`departments\``);
        await queryRunner.query(`DROP TABLE \`departments\``);
        await queryRunner.query(`DROP INDEX \`IDX_05dafe63b4aef16ec0897d2441\` ON \`budget_data_change_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_4ccc019cb6a4fdbb48408b5320\` ON \`budget_data_change_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_bc85d034d88a190d417eed1f91\` ON \`budget_data_change_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_bfa7425b2d679c9a80da691a34\` ON \`budget_data_change_log\``);
        await queryRunner.query(`DROP TABLE \`budget_data_change_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_e1464335244e5f89c2d6255c4e\` ON \`budget_data\``);
        await queryRunner.query(`DROP INDEX \`IDX_a571f60387d2bdb4663f32ea96\` ON \`budget_data\``);
        await queryRunner.query(`DROP INDEX \`IDX_2563faf321da237126c482255e\` ON \`budget_data\``);
        await queryRunner.query(`DROP INDEX \`IDX_428ec0a471b38696df19f10ce0\` ON \`budget_data\``);
        await queryRunner.query(`DROP INDEX \`IDX_a79fb67dab3a62f8ba716a743e\` ON \`budget_data\``);
        await queryRunner.query(`DROP INDEX \`IDX_be86d0e7b8acf75bf3368aa8e9\` ON \`budget_data\``);
        await queryRunner.query(`DROP INDEX \`IDX_549413ce5bca021ad3a34b3225\` ON \`budget_data\``);
        await queryRunner.query(`DROP INDEX \`IDX_09b5e57d4895ace88b0451f1fb\` ON \`budget_data\``);
        await queryRunner.query(`DROP TABLE \`budget_data\``);
        await queryRunner.query(`DROP TABLE \`google_sheet_column_mapping\``);
        await queryRunner.query(`DROP TABLE \`google_sheet_sync_log\``);
        await queryRunner.query(`DROP TABLE \`google_sheet_sync_schedule\``);
        await queryRunner.query(`DROP INDEX \`IDX_637a27f2759e258a7f197e9152\` ON \`sync_snapshots\``);
        await queryRunner.query(`DROP TABLE \`sync_snapshots\``);
        await queryRunner.query(`DROP TABLE \`google_sheet_webhook_config\``);
        await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` CHANGE \`department_id\` \`category_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`budget_activity\` CHANGE \`department_id\` \`category_id\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_budget_department_id\` ON \`budget\` (\`department_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c3dd9f7a5f6f90c5d1b3087fb4\` ON \`activity\` (\`livrableId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_19938e31a1e6e78edfa60d5288\` ON \`sousActivity\` (\`livrableId\`)`);
        await queryRunner.query(`ALTER TABLE \`mapping_cash_flow\` ADD CONSTRAINT \`FK_mapping_cash_flow_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`budget_activity\` ADD CONSTRAINT \`FK_budget_activity_mapping\` FOREIGN KEY (\`mapping_cash_flow_id\`) REFERENCES \`mapping_cash_flow\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_activity\` ADD CONSTRAINT \`FK_budget_activity_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`budget_sous_activity\` ADD CONSTRAINT \`FK_budget_sous_activity_activity\` FOREIGN KEY (\`activity_id\`) REFERENCES \`budget_activity\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_tache\` ADD CONSTRAINT \`FK_budget_tache_sous_activity\` FOREIGN KEY (\`sous_activity_id\`) REFERENCES \`budget_sous_activity\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_budget_tache\` FOREIGN KEY (\`tache_id\`) REFERENCES \`budget_tache\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_budget_sous_activity\` FOREIGN KEY (\`sous_activity_id\`) REFERENCES \`budget_sous_activity\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_budget_mapping_cash_flow\` FOREIGN KEY (\`mapping_cash_flow_id\`) REFERENCES \`mapping_cash_flow\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_budget_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`department\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_budget_activity\` FOREIGN KEY (\`activity_id\`) REFERENCES \`budget_activity\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_activity_mapping_cash_flow\` FOREIGN KEY (\`mapping_cash_flow_id\`) REFERENCES \`mapping_cash_flow\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
