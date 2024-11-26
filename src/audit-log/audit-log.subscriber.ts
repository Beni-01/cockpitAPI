import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    RemoveEvent,
  } from 'typeorm';
import { AuditLogService } from './audit-log.service';

  
  @EventSubscriber()
  export class AuditSubscriber implements EntitySubscriberInterface {
    constructor(private readonly auditService: AuditLogService) {}
  
    async afterInsert(event: InsertEvent<any>) {
      await this.auditService.log(
        event.metadata.tableName,
        event.entity.id,
        'CREATE',
        null,
        event.entity,
        event.queryRunner.data?.userId || null, // Utilisateur connecté (à configurer)
      );
    }
  
    async afterUpdate(event: UpdateEvent<any>) {
      await this.auditService.log(
        event.metadata.tableName,
        event.entity.id,
        'UPDATE',
        event.databaseEntity, // Anciennes données
        event.entity, // Nouvelles données
        event.queryRunner.data?.userId || null,
      );
    }
  
    async afterRemove(event: RemoveEvent<any>) {
      await this.auditService.log(
        event.metadata.tableName,
        event.entityId,
        'DELETE',
        event.databaseEntity, // Données supprimées
        null,
        event.queryRunner.data?.userId || null,
      );
    }
  }
  