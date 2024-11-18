import { MigrationInterface, QueryRunner } from "typeorm";

export class IntegrityActivity1731956348927 implements MigrationInterface {
    name = 'IntegrityActivity1731956348927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_0b60e6cf85e054f08ab9c019a78\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_85fe1974be2cafc824f151bf288\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_f31746ae11a090306b0b2670b00\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`activityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`activityId\` int NOT NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_f31746ae11a090306b0b2670b00\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_85fe1974be2cafc824f151bf288\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_38e5f6d4a785ff0ec835c6fb943\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_0b60e6cf85e054f08ab9c019a78\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_60bc4dbcd1770ec0a6b689640a1\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`grade\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`grade\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`fonction\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`fonction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`direction\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`direction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`telephone\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`telephone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`prenom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`prenom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`postnom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`postnom\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`nom\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`nom\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`status\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`titre\``);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`titre\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`livrable\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`livrable\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`budget\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`budget\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`indicateur\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`indicateur\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`fin\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`fin\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`debut\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`debut\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`autreService\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`autreService\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`responsable\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`responsable\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`province\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`province\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`resultat\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`resultat\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`titre\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD \`titre\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`commentaire\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`commentaire\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`reponse\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`reponse\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`niveau\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`niveau\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`impact\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`impact\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP COLUMN \`activityId\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP COLUMN \`activityId\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_f31746ae11a090306b0b2670b00\` FOREIGN KEY (\`agentDelegueId\`) REFERENCES \`f360db\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_85fe1974be2cafc824f151bf288\` FOREIGN KEY (\`directeurId\`) REFERENCES \`f360db\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_3571467bcbe021f66e2bdce96ea\` FOREIGN KEY (\`userId\`) REFERENCES \`f360db\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_0b60e6cf85e054f08ab9c019a78\` FOREIGN KEY (\`userId\`) REFERENCES \`f360db\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_856efdd136dff1362f39e292a5d\` FOREIGN KEY (\`userId\`) REFERENCES \`f360db\`.\`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
