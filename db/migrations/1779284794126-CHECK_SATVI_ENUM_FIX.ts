import { MigrationInterface, QueryRunner } from "typeorm";

export class CHECKSATVIENUMFIX1779284794126 implements MigrationInterface {
    name = 'CHECKSATVIENUMFIX1779284794126'

    public async up(queryRunner: QueryRunner): Promise<void> {
   
        
       // await queryRunner.query(`CREATE TABLE \`satvi_mission_invitation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`mission_id\` int NOT NULL, \`user_id\` int NULL, \`nom_complet\` varchar(220) NOT NULL, \`email\` varchar(180) NULL, \`direction\` varchar(180) NULL, \`token\` varchar(120) NOT NULL, \`invitation_link\` varchar(500) NOT NULL, \`status\` varchar(30) NOT NULL DEFAULT 'preparee', \`sent_at\` datetime NULL, \`used_at\` datetime NULL, \`send_error\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_satvi_invitation_token\` (\`token\`), INDEX \`IDX_satvi_invitation_user\` (\`user_id\`), INDEX \`IDX_satvi_invitation_mission\` (\`mission_id\`), UNIQUE INDEX \`IDX_e08783ad96e880d865b7d22f19\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        //await queryRunner.query(`CREATE TABLE \`satvi_mission\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`reference_code\` varchar(50) NOT NULL, \`titre\` varchar(180) NOT NULL, \`description\` text NULL, \`date_debut\` date NOT NULL, \`date_fin\` date NOT NULL, \`coordination_id\` int NOT NULL, \`province\` varchar(150) NOT NULL, \`coordination_nom\` varchar(180) NOT NULL, \`type_mission\` varchar(50) NOT NULL, \`type_mission_autre\` varchar(150) NULL, \`status\` varchar(30) NOT NULL DEFAULT 'active', \`created_by\` int NULL, \`sent_at\` datetime NULL, INDEX \`IDX_satvi_mission_type\` (\`type_mission\`), INDEX \`IDX_satvi_mission_dates\` (\`date_debut\`, \`date_fin\`), INDEX \`IDX_satvi_mission_status\` (\`status\`), INDEX \`IDX_satvi_mission_coordination\` (\`coordination_id\`), UNIQUE INDEX \`IDX_dc3331e8ad94c0f52fc389f8c8\` (\`reference_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
      

        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` ADD \`mission_id\` int NULL`);
       
        await queryRunner.query(`DROP INDEX \`IDX_satvi_type_mission\` ON \`satvi_questionnaire\``);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` DROP COLUMN \`type_mission\``);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` ADD \`type_mission\` varchar(50) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_satvi_status\` ON \`satvi_questionnaire\``);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` ADD \`status\` varchar(30) NOT NULL DEFAULT 'soumis'`);
        
        await queryRunner.query(`CREATE INDEX \`IDX_satvi_questionnaire_mission\` ON \`satvi_questionnaire\` (\`mission_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_satvi_status\` ON \`satvi_questionnaire\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_satvi_type_mission\` ON \`satvi_questionnaire\` (\`type_mission\`)`);
              
        await queryRunner.query(`ALTER TABLE \`satvi_mission_invitation\` ADD CONSTRAINT \`FK_cd1d46fb7d3fafd978dcd59ecf3\` FOREIGN KEY (\`mission_id\`) REFERENCES \`satvi_mission\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission_invitation\` ADD CONSTRAINT \`FK_1a1c9f81d5edc97e5d519032471\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_mission\` ADD CONSTRAINT \`FK_90e09744408703a5d3ff2983796\` FOREIGN KEY (\`coordination_id\`) REFERENCES \`coordination\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`satvi_questionnaire\` ADD CONSTRAINT \`FK_4938c9141b4e0531c7948e4d7ef\` FOREIGN KEY (\`mission_id\`) REFERENCES \`satvi_mission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
