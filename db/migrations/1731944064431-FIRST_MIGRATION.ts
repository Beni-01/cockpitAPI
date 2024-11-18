import { MigrationInterface, QueryRunner } from "typeorm";

export class FIRSTMIGRATION1731944064431 implements MigrationInterface {
    name = 'FIRSTMIGRATION1731944064431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`activity\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`titre\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`dateDebut\` date NULL, \`dateFin\` date NULL, \`status\` varchar(255) NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sousActivity\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL, \`titre\` varchar(255) NOT NULL, \`resultat\` varchar(255) NOT NULL, \`province\` varchar(255) NOT NULL, \`responsable\` varchar(255) NOT NULL, \`autreService\` varchar(255) NULL, \`debut\` varchar(255) NOT NULL, \`fin\` varchar(255) NOT NULL, \`indicateur\` varchar(255) NOT NULL, \`budget\` varchar(255) NOT NULL, \`livrable\` varchar(255) NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`demandeProlongation\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`description\` varchar(255) NOT NULL, \`impact\` varchar(255) NOT NULL, \`niveau\` varchar(255) NOT NULL, \`reponse\` varchar(255) NOT NULL, \`commentaire\` varchar(255) NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`signature\` text NULL, \`postnom\` varchar(255) NULL, \`prenom\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`sexe\` char NOT NULL, \`telephone\` varchar(255) NULL, \`otp\` text NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`isSupervisor\` tinyint NOT NULL DEFAULT 0, \`isActive\` tinyint NOT NULL DEFAULT 0, \`status\` tinyint NOT NULL DEFAULT 1, \`directionId\` int NULL, \`direction\` varchar(255) NULL, \`fonction\` varchar(255) NULL, \`grade\` varchar(255) NULL, \`directeurId\` int NULL, \`agentDelegueId\` int NULL, UNIQUE INDEX \`REL_f31746ae11a090306b0b2670b0\` (\`agentDelegueId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_3571467bcbe021f66e2bdce96ea\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` ADD CONSTRAINT \`FK_0b60e6cf85e054f08ab9c019a78\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` ADD CONSTRAINT \`FK_856efdd136dff1362f39e292a5d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_85fe1974be2cafc824f151bf288\` FOREIGN KEY (\`directeurId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_f31746ae11a090306b0b2670b00\` FOREIGN KEY (\`agentDelegueId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_f31746ae11a090306b0b2670b00\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_85fe1974be2cafc824f151bf288\``);
        await queryRunner.query(`ALTER TABLE \`demandeProlongation\` DROP FOREIGN KEY \`FK_856efdd136dff1362f39e292a5d\``);
        await queryRunner.query(`ALTER TABLE \`sousActivity\` DROP FOREIGN KEY \`FK_0b60e6cf85e054f08ab9c019a78\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\``);
        await queryRunner.query(`DROP INDEX \`REL_f31746ae11a090306b0b2670b0\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`demandeProlongation\``);
        await queryRunner.query(`DROP TABLE \`sousActivity\``);
        await queryRunner.query(`DROP TABLE \`activity\``);
    }

}
