import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { AuditLogService } from './audit-log.service';
  
  @Injectable()
  export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditLogService: AuditLogService) {}
  
    intercept(context: ExecutionContext, next: CallHandler){
      const request = context.switchToHttp().getRequest();
      const { method, url, body, user, queryRunner } = request;
      const entityId = +this.getEntityId(url)// Assurez-vous que l'ID est disponible dans le corps de la requête
  
      return next.handle().pipe(
        tap(() => {
          const action = this.getAction(method);
          const tableName = this.getTableName(url);
          const userId = body.performedId ? body.performedId : queryRunner.data.userId;

          if(action!='READ'){
            this.auditLogService.log(
                tableName,
                entityId,
                action,
                null, // Vous pouvez capturer l'ancien état de l'entité avant la mise à jour
                body,
                userId,
              );
          }


        }),
      );
    }
  
    private getAction(method: string): string {
      switch (method) {
        case 'POST':
          return 'CREATE';
        case 'GET':
          return 'READ';
        case 'PUT':
        case 'PATCH':
          return 'UPDATE';
        case 'DELETE':
          return 'DELETE';
        default:
          return 'UNKNOWN';
      }
    }
  
    private getTableName(url: string): string {
      // Extrait le nom de la table à partir de l'URL
      const parts = url.split('/');
      return parts[1]; // Assurez-vous que l'URL est structurée correctement
    }

    private getEntityId(url: string): string {
        const match = url.match(/^\/?[^\/]+\/(\d+)/);
        return match ? match[1] : '';
      }
      
      
  }