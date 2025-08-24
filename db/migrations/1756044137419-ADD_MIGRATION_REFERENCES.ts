import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDMIGRATIONREFERENCES1756044137419 implements MigrationInterface {
    name = 'ADDMIGRATIONREFERENCES1756044137419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Vérifier et ajouter les contraintes d'intégrité référentielle si elles n'existent pas
        await this.addForeignKeyIfNotExists(queryRunner, 
            'demande-user', 
            'FK_80ae216f4dfda7bff6674374bd6', 
            '(`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
        );
        
        await this.addForeignKeyIfNotExists(queryRunner, 
            'demande-user', 
            'FK_d411ca74f66a0e0012597c196de', 
            '(`demandeId`) REFERENCES `demandeProlongation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
        );
        
        await this.addForeignKeyIfNotExists(queryRunner, 
            'user-livrable', 
            'FK_d441346a0c52533284ea4dc9c4f', 
            '(`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
        );
        
        await this.addForeignKeyIfNotExists(queryRunner, 
            'user-livrable', 
            'FK_e9ce17b02719b8b282200c80ebc', 
            '(`livrableId`) REFERENCES `livrable`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
        );
        
        await this.addForeignKeyIfNotExists(queryRunner, 
            'auditLog', 
            'FK_3db0f7e715a0e3516bdf2e52877', 
            '(`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
        );
        
        await this.addForeignKeyIfNotExists(queryRunner, 
            'passation_marche', 
            'FK_9a5815cc1c8bc800c0ee4b12a57', 
            '(`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
    }

    private async addForeignKeyIfNotExists(queryRunner: QueryRunner, tableName: string, constraintName: string, constraintDefinition: string): Promise<void> {
        try {
            // Vérifier si la contrainte existe déjà
            const table = await queryRunner.getTable(tableName);
            if (table) {
                const foreignKey = table.foreignKeys.find(fk => fk.name === constraintName);
                if (!foreignKey) {
                    await queryRunner.query(`ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`${constraintName}\` FOREIGN KEY ${constraintDefinition}`);
                    console.log(`Contrainte ${constraintName} ajoutée à la table ${tableName}`);
                } else {
                    console.log(`Contrainte ${constraintName} existe déjà dans la table ${tableName}`);
                }
            }
        } catch (error) {
            console.warn(`Erreur lors de l'ajout de la contrainte ${constraintName}: ${error.message}`);
            // Continuer même en cas d'erreur
        }
    }

}
