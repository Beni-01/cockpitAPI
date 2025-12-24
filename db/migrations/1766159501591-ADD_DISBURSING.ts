import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDDISBURSING1766159501591 implements MigrationInterface {
    name = 'ADDDISBURSING1766159501591'

    public async up(queryRunner: QueryRunner): Promise<void> {
    
        
        await queryRunner.query(`CREATE TABLE \`disbursements\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`documentDate\` date NOT NULL, \`direction\` varchar(100) NOT NULL, \`reference\` varchar(100) NOT NULL, \`expenseNature\` text NOT NULL, \`beneficiary\` text NOT NULL, \`eurAmount\` decimal(15,2) NULL, \`cdfAmount\` decimal(15,2) NULL, \`exchangeRate\` decimal(10,4) NULL, \`usdAmount\` decimal(15,2) NOT NULL, \`paymentSource\` varchar(100) NOT NULL, \`supportingDocumentation\` text NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'EN ATTENTE', \`month\` varchar(100) NULL, \`period\` varchar(100) NULL, \`notes\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

}
