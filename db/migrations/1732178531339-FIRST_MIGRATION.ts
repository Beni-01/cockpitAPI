import { MigrationInterface, QueryRunner } from "typeorm";

export class FIRSTMIGRATION1732178531339 implements MigrationInterface {
    name = 'FIRSTMIGRATION1732178531339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`demandeProlongation\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`description\` varchar(255) NOT NULL, \`impact\` varchar(255) NOT NULL, \`niveau\` varchar(255) NOT NULL, \`reponse\` varchar(255) NOT NULL DEFAULT 'En attente', \`commentaire\` varchar(255) NOT NULL, \`userId\` int NULL, \`activityId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`signature\` text NULL, \`postnom\` varchar(255) NULL, \`prenom\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`sexe\` char NOT NULL, \`telephone\` varchar(255) NULL, \`otp\` text NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`isSupervisor\` tinyint NOT NULL DEFAULT 0, \`isActive\` tinyint NOT NULL DEFAULT 0, \`status\` tinyint NOT NULL DEFAULT 1, \`directionId\` int NULL, \`serviceId\` int NULL, \`divisionId\` int NULL, \`division\` varchar(255) NULL, \`service\` varchar(255) NULL, \`direction\` varchar(255) NULL, \`fonction\` varchar(255) NULL, \`grade\` varchar(255) NULL, \`directeurId\` int NULL, \`agentDelegueId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`annotationActivity\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NULL DEFAULT 'COMMENTAIRE', \`text\` text NOT NULL, \`activityId\` int NOT NULL, \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`activity\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`titre\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`resultat\` varchar(255) NOT NULL, \`resultatObtenu\` varchar(255) NULL, \`province\` varchar(255) NOT NULL, \`responsable\` varchar(255) NOT NULL, \`budget\` int NULL, \`budgetConsomme\` int NULL, \`livrable\` varchar(255) NOT NULL, \`dateDebut\` date NULL, \`dateFin\` date NULL, \`dateFinReel\` date NULL, \`status\` varchar(255) NULL DEFAULT 'En attente', \`etat\` varchar(255) NULL DEFAULT 'En attente', \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sousActivity\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`titre\` varchar(255) NOT NULL, \`resultat\` varchar(255) NOT NULL, \`province\` varchar(255) NOT NULL, \`responsable\` varchar(255) NOT NULL, \`autreService\` varchar(255) NULL, \`debut\` varchar(255) NOT NULL, \`fin\` varchar(255) NOT NULL, \`dateFinReel\` date NULL, \`indicateur\` varchar(255) NULL, \`resultatObtenu\` varchar(255) NULL, \`status\` varchar(255) NULL DEFAULT 'En attente', \`budget\` int NOT NULL, \`budgetConsomme\` int NULL, \`livrable\` varchar(255) NOT NULL, \`activityId\` int NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_856efdd136dff1362f39e292a5d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_60bc4dbcd1770ec0a6b689640a1\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD CONSTRAINT \`FK_c21c8b2f96df2aaa95bc9b3e852\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` ADD CONSTRAINT \`FK_79050c9930c98928590df36b1bc\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_3571467bcbe021f66e2bdce96ea\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_0b60e6cf85e054f08ab9c019a78\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_38e5f6d4a785ff0ec835c6fb943\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_38e5f6d4a785ff0ec835c6fb943\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_0b60e6cf85e054f08ab9c019a78\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\``);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP FOREIGN KEY \`FK_79050c9930c98928590df36b1bc\``);
        await queryRunner.query(`ALTER TABLE \`annotationActivity\` DROP FOREIGN KEY \`FK_c21c8b2f96df2aaa95bc9b3e852\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_60bc4dbcd1770ec0a6b689640a1\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`DROP TABLE \`sousActivity\``);
        await queryRunner.query(`DROP TABLE \`activity\``);
        await queryRunner.query(`DROP TABLE \`annotationActivity\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`demandeProlongation\``);
    }

}
