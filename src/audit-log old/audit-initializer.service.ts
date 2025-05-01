import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLogService } from './audit-log.service';


@Injectable()
export class AuditInitializerService implements OnApplicationBootstrap {
  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditLogService,
  ) {}

  async onApplicationBootstrap() {
    console.log('Starting audit initialization...');

    // Liste des tables à auditer
    const tables = ['annotationActivity', 'activity', 'demandeProlongation', 'livrable', 'sousActivity', 'user'];

    for (const table of tables) {
      const rows = await this.dataSource.query(`SELECT * FROM ${table}`);

      for (const row of rows) {
        // Insérer manuellement un log pour chaque enregistrement
        await this.auditService.log(
          table,
          row.id, // Identifiant de la ligne
          'INITIAL', // Type d'action personnalisée
          null, // Anciennes données (aucune)
          row, // Données actuelles
          row.userId || null, // ID de l'utilisateur non applicable ici
        );
      }
    }

    console.log('Audit initialization completed with successfully');
  }
}
