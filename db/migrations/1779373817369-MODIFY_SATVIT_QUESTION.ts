import { MigrationInterface, QueryRunner } from "typeorm";

export class MODIFYSATVITQUESTION1779373817369 implements MigrationInterface {
    name = 'MODIFYSATVITQUESTION1779373817369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP FOREIGN KEY \`FK_79050c9930c98928590df36b1bc\``);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP FOREIGN KEY \`FK_c21c8b2f96df2aaa95bc9b3e852\``);
        await queryRunner.query(`ALTER TABLE \`demande-user\` DROP FOREIGN KEY \`FK_80ae216f4dfda7bff6674374bd6\``);
        await queryRunner.query(`ALTER TABLE \`demande-user\` DROP FOREIGN KEY \`FK_d411ca74f66a0e0012597c196de\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_60bc4dbcd1770ec0a6b689640a1\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` DROP FOREIGN KEY \`FK_d441346a0c52533284ea4dc9c4f\``);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` DROP FOREIGN KEY \`FK_e9ce17b02719b8b282200c80ebc\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_c3dd9f7a5f6f90c5d1b3087fb49\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP FOREIGN KEY \`FK_3db0f7e715a0e3516bdf2e52877\``);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` DROP FOREIGN KEY \`FK_bffea4bf04cf6a53bfbeeed9548\``);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` DROP FOREIGN KEY \`FK_cd9c1ea2613cd2b764a5c7b16ff\``);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` DROP FOREIGN KEY \`FK_7cc4f31ae48e9427115058b549a\``);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` DROP FOREIGN KEY \`FK_c9b926f6fb728145cd87dfa103b\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_0b60e6cf85e054f08ab9c019a78\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_19938e31a1e6e78edfa60d52881\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_38e5f6d4a785ff0ec835c6fb943\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP FOREIGN KEY \`FK_69e666f90eaa3ce3903c80abfa9\``);
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_mission_invitation', 'user_id');
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_mission_invitation', 'mission_id');
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_mission', 'coordination_id');
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_questionnaire', 'mission_id');
        await queryRunner.query(`ALTER TABLE \`presence\` DROP FOREIGN KEY \`FK_6c0fa00ffa14c9eaf62cc32a600\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_1ced25315eb974b73391fb1c81b\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP FOREIGN KEY \`FK_c15e48cef0b736293f9f0effac1\``);
        await queryRunner.query(`CREATE TABLE \`icm_checklist\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`coordinationId\` int NOT NULL, \`month\` int NOT NULL, \`year\` int NOT NULL, \`status\` enum ('Brouillon', 'Soumis', 'Validé', 'Rejeté') NOT NULL DEFAULT 'Brouillon', \`scoreICM\` float NULL, \`createdBy\` int NOT NULL, \`submittedAt\` datetime NULL, \`validatedBy\` int NULL, \`validatedAt\` datetime NULL, \`rejectionReason\` varchar(500) NULL, UNIQUE INDEX \`IDX_8f444bbf60908195cebfb203ae\` (\`coordinationId\`, \`month\`, \`year\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`icm_checklist_response\` (\`id\` int NOT NULL AUTO_INCREMENT, \`checklistId\` int NOT NULL, \`questionId\` int NOT NULL, \`realised\` tinyint NOT NULL DEFAULT 0, \`conformityLevel\` enum ('Conforme', 'Partiellement conforme', 'Non conforme') NULL, \`comment\` text NULL, \`proofProvided\` text NULL, \`scoreItem\` float NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`icm_question\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`label\` varchar(500) NOT NULL, \`category\` enum ('RH', 'LOGISTIQUE', 'FINANCE', 'ADMINISTRATION') NOT NULL, \`periodicity\` enum ('Hebdomadaire', 'Mensuel', 'Trimestriel', 'Semestriel', 'Annuel') NOT NULL, \`expectedProof\` text NOT NULL, \`order\` int NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`signature\` varchar(255) NULL`);
        await this.addColumnIfMissing(queryRunner, 'satvi_questionnaire', 'question_count', `int NOT NULL DEFAULT '19'`);
        await this.addColumnIfMissing(queryRunner, 'satvi_questionnaire', 'aspect_accueil_ameliorer', `text NULL`);
        await this.addColumnIfMissing(queryRunner, 'satvi_questionnaire', 'difficulte_organisationnelle', `text NULL`);
        await this.addColumnIfMissing(queryRunner, 'satvi_questionnaire', 'amelioration_collaboration_terrain', `text NULL`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD \`type\` varchar(255) NULL DEFAULT 'COMMENTAIRE'`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`impact\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`impact\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`niveau\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`niveau\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`reponse\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`reponse\` varchar(255) NOT NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`livrable\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`livrable\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`responsable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateLivraisonAttendue\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateLivraisonAttendue\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateLivraisonReelle\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateLivraisonReelle\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`typelivrable\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`typelivrable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`livrablefileName\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`livrablefileName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`support\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`support\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateValidationAttendue\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateValidationAttendue\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateValidationReel\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateValidationReel\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`commentaire\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`commentaire\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`resultat\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`resultat\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`resultatObtenu\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`resultatObtenu\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`province\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`province\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`direction\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`direction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`responsable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`etat\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`etat\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`priorite\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`priorite\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`coordination\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`coordination\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`lieuExecution\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`lieuExecution\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`tableName\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD \`tableName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`action\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD \`action\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`nom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`nom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`postnom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`postnom\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`prenom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`prenom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`sexe\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`sexe\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`telephone\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`telephone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`otp\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`otp\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(255) NOT NULL DEFAULT 'N/A'`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`division\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`division\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`service\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`service\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`direction\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`direction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`fonction\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`fonction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`grade\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`grade\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`province\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`province\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`responsable\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`autreService\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`autreService\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`debut\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`debut\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`fin\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`fin\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`coordination\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`coordination\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`lieuExecution\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`lieuExecution\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`nom\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`nom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`adresse\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`adresse\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`responsable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`nom\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`nom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` CHANGE \`type\` \`type\` enum ('Recouvrement', 'Administrative', 'Administrative & Recouvrement') NOT NULL DEFAULT 'Administrative'`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`province\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`province\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`adresse\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`adresse\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`coordonnateurNom\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`coordonnateurNom\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`coordonnateurTelephone\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`coordonnateurTelephone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`coordonnateurEmail\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`coordonnateurEmail\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` CHANGE \`evaluation_count\` \`evaluation_count\` int NOT NULL DEFAULT '14'`);
        await queryRunner.query(`ALTER TABLE \`project_copir\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`project_copir\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkInLatitude\` \`checkInLatitude\` decimal(10,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkOutLatitude\` \`checkOutLatitude\` decimal(10,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` DROP COLUMN \`deviceInfo\``);
        await queryRunner.query(`ALTER TABLE \`presence\` ADD \`deviceInfo\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`link\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`link\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP COLUMN \`marque\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD \`marque\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP COLUMN \`modele\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD \`modele\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_d01a8fe3d1e75531463cab78b6\` ON \`charroi\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP COLUMN \`immatriculation\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD \`immatriculation\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD UNIQUE INDEX \`IDX_d01a8fe3d1e75531463cab78b6\` (\`immatriculation\`)`);
        await queryRunner.query(`ALTER TABLE \`tresorerie_mouvement\` DROP COLUMN \`motif\``);
        await queryRunner.query(`ALTER TABLE \`tresorerie_mouvement\` ADD \`motif\` varchar(255) NOT NULL COMMENT 'Motif ou libellé du mouvement (ex: Frais de communication)'`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` CHANGE \`type\` \`type\` enum ('Recouvrement', 'Administrative', 'Administrative & Recouvrement') NOT NULL DEFAULT 'Administrative'`);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` CHANGE \`evaluation_count\` \`evaluation_count\` int NOT NULL DEFAULT '14'`);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkInLatitude\` \`checkInLatitude\` decimal(10,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkOutLatitude\` \`checkOutLatitude\` decimal(10,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD CONSTRAINT \`FK_c21c8b2f96df2aaa95bc9b3e852\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD CONSTRAINT \`FK_79050c9930c98928590df36b1bc\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demande-user\` ADD CONSTRAINT \`FK_80ae216f4dfda7bff6674374bd6\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demande-user\` ADD CONSTRAINT \`FK_d411ca74f66a0e0012597c196de\` FOREIGN KEY (\`demandeId\`) REFERENCES \`demandeProlongation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_856efdd136dff1362f39e292a5d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_60bc4dbcd1770ec0a6b689640a1\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` ADD CONSTRAINT \`FK_d441346a0c52533284ea4dc9c4f\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` ADD CONSTRAINT \`FK_e9ce17b02719b8b282200c80ebc\` FOREIGN KEY (\`livrableId\`) REFERENCES \`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_3571467bcbe021f66e2bdce96ea\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_c3dd9f7a5f6f90c5d1b3087fb49\` FOREIGN KEY (\`livrableId\`) REFERENCES \`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD CONSTRAINT \`FK_3db0f7e715a0e3516bdf2e52877\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` ADD CONSTRAINT \`FK_cd9c1ea2613cd2b764a5c7b16ff\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` ADD CONSTRAINT \`FK_bffea4bf04cf6a53bfbeeed9548\` FOREIGN KEY (\`sousActivityId\`) REFERENCES \`sousActivity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` ADD CONSTRAINT \`FK_c9b926f6fb728145cd87dfa103b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` ADD CONSTRAINT \`FK_7cc4f31ae48e9427115058b549a\` FOREIGN KEY (\`sousActivityId\`) REFERENCES \`sousActivity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_0b60e6cf85e054f08ab9c019a78\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_38e5f6d4a785ff0ec835c6fb943\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_19938e31a1e6e78edfa60d52881\` FOREIGN KEY (\`livrableId\`) REFERENCES \`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD CONSTRAINT \`FK_69e666f90eaa3ce3903c80abfa9\` FOREIGN KEY (\`coordinationId\`) REFERENCES \`coordination\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission_invitation\` ADD CONSTRAINT \`FK_cd1d46fb7d3fafd978dcd59ecf3\` FOREIGN KEY (\`mission_id\`) REFERENCES \`satvi_mission\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission_invitation\` ADD CONSTRAINT \`FK_1a1c9f81d5edc97e5d519032471\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission\` ADD CONSTRAINT \`FK_90e09744408703a5d3ff2983796\` FOREIGN KEY (\`coordination_id\`) REFERENCES \`coordination\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` ADD CONSTRAINT \`FK_4938c9141b4e0531c7948e4d7ef\` FOREIGN KEY (\`mission_id\`) REFERENCES \`satvi_mission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`presence\` ADD CONSTRAINT \`FK_6c0fa00ffa14c9eaf62cc32a600\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`icm_checklist\` ADD CONSTRAINT \`FK_4e782e56b946d0e6c66d1262035\` FOREIGN KEY (\`coordinationId\`) REFERENCES \`coordination\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`icm_checklist\` ADD CONSTRAINT \`FK_3e30d43587cbea2eeb33f07ae6e\` FOREIGN KEY (\`createdBy\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`icm_checklist\` ADD CONSTRAINT \`FK_0b1014f46f4b18e0309211fc04a\` FOREIGN KEY (\`validatedBy\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`icm_checklist_response\` ADD CONSTRAINT \`FK_e381d4bc5e97eb755848d27d0d8\` FOREIGN KEY (\`checklistId\`) REFERENCES \`icm_checklist\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`icm_checklist_response\` ADD CONSTRAINT \`FK_e546c7f66a3d3f7e18fba730839\` FOREIGN KEY (\`questionId\`) REFERENCES \`icm_question\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD CONSTRAINT \`FK_c15e48cef0b736293f9f0effac1\` FOREIGN KEY (\`coordinationId\`) REFERENCES \`coordination\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP FOREIGN KEY \`FK_c15e48cef0b736293f9f0effac1\``);
        await queryRunner.query(`ALTER TABLE \`icm_checklist_response\` DROP FOREIGN KEY \`FK_e546c7f66a3d3f7e18fba730839\``);
        await queryRunner.query(`ALTER TABLE \`icm_checklist_response\` DROP FOREIGN KEY \`FK_e381d4bc5e97eb755848d27d0d8\``);
        await queryRunner.query(`ALTER TABLE \`icm_checklist\` DROP FOREIGN KEY \`FK_0b1014f46f4b18e0309211fc04a\``);
        await queryRunner.query(`ALTER TABLE \`icm_checklist\` DROP FOREIGN KEY \`FK_3e30d43587cbea2eeb33f07ae6e\``);
        await queryRunner.query(`ALTER TABLE \`icm_checklist\` DROP FOREIGN KEY \`FK_4e782e56b946d0e6c66d1262035\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_1ced25315eb974b73391fb1c81b\``);
        await queryRunner.query(`ALTER TABLE \`presence\` DROP FOREIGN KEY \`FK_6c0fa00ffa14c9eaf62cc32a600\``);
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_questionnaire', 'mission_id');
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_mission', 'coordination_id');
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_mission_invitation', 'user_id');
        await this.dropForeignKeysForColumn(queryRunner, 'satvi_mission_invitation', 'mission_id');
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP FOREIGN KEY \`FK_69e666f90eaa3ce3903c80abfa9\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_19938e31a1e6e78edfa60d52881\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_38e5f6d4a785ff0ec835c6fb943\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_0b60e6cf85e054f08ab9c019a78\``);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` DROP FOREIGN KEY \`FK_7cc4f31ae48e9427115058b549a\``);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` DROP FOREIGN KEY \`FK_c9b926f6fb728145cd87dfa103b\``);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` DROP FOREIGN KEY \`FK_bffea4bf04cf6a53bfbeeed9548\``);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` DROP FOREIGN KEY \`FK_cd9c1ea2613cd2b764a5c7b16ff\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP FOREIGN KEY \`FK_3db0f7e715a0e3516bdf2e52877\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_c3dd9f7a5f6f90c5d1b3087fb49\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\``);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` DROP FOREIGN KEY \`FK_e9ce17b02719b8b282200c80ebc\``);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` DROP FOREIGN KEY \`FK_d441346a0c52533284ea4dc9c4f\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_60bc4dbcd1770ec0a6b689640a1\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`ALTER TABLE \`demande-user\` DROP FOREIGN KEY \`FK_d411ca74f66a0e0012597c196de\``);
        await queryRunner.query(`ALTER TABLE \`demande-user\` DROP FOREIGN KEY \`FK_80ae216f4dfda7bff6674374bd6\``);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP FOREIGN KEY \`FK_79050c9930c98928590df36b1bc\``);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP FOREIGN KEY \`FK_c21c8b2f96df2aaa95bc9b3e852\``);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkOutLatitude\` \`checkOutLatitude\` decimal NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkInLatitude\` \`checkInLatitude\` decimal NULL`);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` CHANGE \`evaluation_count\` \`evaluation_count\` int NOT NULL DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE \`coordination\` CHANGE \`type\` \`type\` enum ('Recouvrement', 'Administrative') NOT NULL DEFAULT 'Administrative'`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`tresorerie_mouvement\` DROP COLUMN \`motif\``);
        await queryRunner.query(`ALTER TABLE \`tresorerie_mouvement\` ADD \`motif\` varchar(255) NOT NULL COMMENT 'Motif ou libellé du mouvement (ex: Frais de communication)'`);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP INDEX \`IDX_d01a8fe3d1e75531463cab78b6\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP COLUMN \`immatriculation\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD \`immatriculation\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_d01a8fe3d1e75531463cab78b6\` ON \`charroi\` (\`immatriculation\`)`);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP COLUMN \`modele\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD \`modele\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`charroi\` DROP COLUMN \`marque\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD \`marque\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`link\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`link\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` DROP COLUMN \`deviceInfo\``);
        await queryRunner.query(`ALTER TABLE \`presence\` ADD \`deviceInfo\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkOutLatitude\` \`checkOutLatitude\` decimal NULL`);
        await queryRunner.query(`ALTER TABLE \`presence\` CHANGE \`checkInLatitude\` \`checkInLatitude\` decimal NULL`);
        await queryRunner.query(`ALTER TABLE \`project_copir\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`project_copir\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` CHANGE \`evaluation_count\` \`evaluation_count\` int NOT NULL DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`coordonnateurEmail\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`coordonnateurEmail\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`coordonnateurTelephone\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`coordonnateurTelephone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`coordonnateurNom\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`coordonnateurNom\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`adresse\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`adresse\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`province\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`province\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`coordination\` CHANGE \`type\` \`type\` enum ('Recouvrement', 'Administrative') NOT NULL DEFAULT 'Administrative'`);
        await queryRunner.query(`ALTER TABLE \`coordination\` DROP COLUMN \`nom\``);
        await queryRunner.query(`ALTER TABLE \`coordination\` ADD \`nom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`responsable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`adresse\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`adresse\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`antenne\` DROP COLUMN \`nom\``);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD \`nom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`lieuExecution\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`lieuExecution\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`coordination\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`coordination\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`fin\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`fin\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`debut\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`debut\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`autreService\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`autreService\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`responsable\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`province\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`province\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`grade\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`grade\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`fonction\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`fonction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`direction\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`direction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`service\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`service\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`division\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`division\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(255) NOT NULL DEFAULT 'N/A'`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`otp\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`otp\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`telephone\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`telephone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`sexe\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`sexe\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`prenom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`prenom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`postnom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`postnom\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`nom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`nom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`action\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD \`action\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` DROP COLUMN \`tableName\``);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD \`tableName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`lieuExecution\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`lieuExecution\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`coordination\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`coordination\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nbre_ressource\` \`nbre_ressource\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`deadlineRate\` \`deadlineRate\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`priorite\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`priorite\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`etat\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`etat\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`responsable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`direction\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`direction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`province\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`province\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`resultatObtenu\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`resultatObtenu\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`resultat\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`resultat\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` CHANGE \`livrableQuality\` \`livrableQuality\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`commentaire\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`commentaire\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateValidationReel\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateValidationReel\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateValidationAttendue\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateValidationAttendue\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`support\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`support\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`livrablefileName\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`livrablefileName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`typelivrable\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`typelivrable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateLivraisonReelle\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateLivraisonReelle\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`dateLivraisonAttendue\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`dateLivraisonAttendue\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`responsable\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`status\` varchar(255) NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`livrable\` DROP COLUMN \`livrable\``);
        await queryRunner.query(`ALTER TABLE \`livrable\` ADD \`livrable\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`reponse\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`reponse\` varchar(255) NOT NULL DEFAULT 'En attente'`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`niveau\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`niveau\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`impact\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`impact\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD \`type\` varchar(255) NULL DEFAULT 'COMMENTAIRE'`);
        await this.dropColumnIfExists(queryRunner, 'satvi_questionnaire', 'amelioration_collaboration_terrain');
        await this.dropColumnIfExists(queryRunner, 'satvi_questionnaire', 'difficulte_organisationnelle');
        await this.dropColumnIfExists(queryRunner, 'satvi_questionnaire', 'aspect_accueil_ameliorer');
        await this.dropColumnIfExists(queryRunner, 'satvi_questionnaire', 'question_count');
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`signature\``);
        await queryRunner.query(`DROP TABLE \`icm_question\``);
        await queryRunner.query(`DROP TABLE \`icm_checklist_response\``);
        await queryRunner.query(`DROP INDEX \`IDX_8f444bbf60908195cebfb203ae\` ON \`icm_checklist\``);
        await queryRunner.query(`DROP TABLE \`icm_checklist\``);
        await queryRunner.query(`ALTER TABLE \`charroi\` ADD CONSTRAINT \`FK_c15e48cef0b736293f9f0effac1\` FOREIGN KEY (\`coordinationId\`) REFERENCES \`cockpitdb\`.\`coordination\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`presence\` ADD CONSTRAINT \`FK_6c0fa00ffa14c9eaf62cc32a600\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` ADD CONSTRAINT \`FK_4938c9141b4e0531c7948e4d7ef\` FOREIGN KEY (\`mission_id\`) REFERENCES \`cockpitdb\`.\`satvi_mission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission\` ADD CONSTRAINT \`FK_90e09744408703a5d3ff2983796\` FOREIGN KEY (\`coordination_id\`) REFERENCES \`cockpitdb\`.\`coordination\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission_invitation\` ADD CONSTRAINT \`FK_cd1d46fb7d3fafd978dcd59ecf3\` FOREIGN KEY (\`mission_id\`) REFERENCES \`cockpitdb\`.\`satvi_mission\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission_invitation\` ADD CONSTRAINT \`FK_1a1c9f81d5edc97e5d519032471\` FOREIGN KEY (\`user_id\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`antenne\` ADD CONSTRAINT \`FK_69e666f90eaa3ce3903c80abfa9\` FOREIGN KEY (\`coordinationId\`) REFERENCES \`cockpitdb\`.\`coordination\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_38e5f6d4a785ff0ec835c6fb943\` FOREIGN KEY (\`activityId\`) REFERENCES \`cockpitdb\`.\`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_19938e31a1e6e78edfa60d52881\` FOREIGN KEY (\`livrableId\`) REFERENCES \`cockpitdb\`.\`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_0b60e6cf85e054f08ab9c019a78\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` ADD CONSTRAINT \`FK_c9b926f6fb728145cd87dfa103b\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sous_activity\` ADD CONSTRAINT \`FK_7cc4f31ae48e9427115058b549a\` FOREIGN KEY (\`sousActivityId\`) REFERENCES \`cockpitdb\`.\`sousActivity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` ADD CONSTRAINT \`FK_cd9c1ea2613cd2b764a5c7b16ff\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_activies_assignment\` ADD CONSTRAINT \`FK_bffea4bf04cf6a53bfbeeed9548\` FOREIGN KEY (\`sousActivityId\`) REFERENCES \`cockpitdb\`.\`sousActivity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auditLog\` ADD CONSTRAINT \`FK_3db0f7e715a0e3516bdf2e52877\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_c3dd9f7a5f6f90c5d1b3087fb49\` FOREIGN KEY (\`livrableId\`) REFERENCES \`cockpitdb\`.\`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_3571467bcbe021f66e2bdce96ea\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` ADD CONSTRAINT \`FK_e9ce17b02719b8b282200c80ebc\` FOREIGN KEY (\`livrableId\`) REFERENCES \`cockpitdb\`.\`livrable\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user-livrable\` ADD CONSTRAINT \`FK_d441346a0c52533284ea4dc9c4f\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_856efdd136dff1362f39e292a5d\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_60bc4dbcd1770ec0a6b689640a1\` FOREIGN KEY (\`activityId\`) REFERENCES \`cockpitdb\`.\`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demande-user\` ADD CONSTRAINT \`FK_d411ca74f66a0e0012597c196de\` FOREIGN KEY (\`demandeId\`) REFERENCES \`cockpitdb\`.\`demandeProlongation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demande-user\` ADD CONSTRAINT \`FK_80ae216f4dfda7bff6674374bd6\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD CONSTRAINT \`FK_c21c8b2f96df2aaa95bc9b3e852\` FOREIGN KEY (\`activityId\`) REFERENCES \`cockpitdb\`.\`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD CONSTRAINT \`FK_79050c9930c98928590df36b1bc\` FOREIGN KEY (\`userId\`) REFERENCES \`cockpitdb\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    private async dropForeignKeysForColumn(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
    ): Promise<void> {
        const constraints: Array<{ CONSTRAINT_NAME: string }> = await queryRunner.query(
            `
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
              AND REFERENCED_TABLE_NAME IS NOT NULL
            `,
            [tableName, columnName],
        );

        for (const constraint of constraints) {
            await queryRunner.query(
                `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\``,
            );
        }
    }

    private async addColumnIfMissing(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
        columnDefinition: string,
    ): Promise<void> {
        const exists = await this.columnExists(queryRunner, tableName, columnName);
        if (!exists) {
            await queryRunner.query(
                `ALTER TABLE \`${tableName}\` ADD \`${columnName}\` ${columnDefinition}`,
            );
        }
    }

    private async dropColumnIfExists(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
    ): Promise<void> {
        const exists = await this.columnExists(queryRunner, tableName, columnName);
        if (exists) {
            await queryRunner.query(
                `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``,
            );
        }
    }

    private async columnExists(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
    ): Promise<boolean> {
        const rows: Array<{ COLUMN_NAME: string }> = await queryRunner.query(
            `
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
            `,
            [tableName, columnName],
        );

        return rows.length > 0;
    }

}
