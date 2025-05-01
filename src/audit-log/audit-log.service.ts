import { Injectable } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    tableNameData: string,
    entityIdData: number,
    actionData: string,
    old: any,
    news: any,
    userId: number,
  ) {
    const log = this.auditLogRepository.create({
      tableName:tableNameData,
      entityId:entityIdData || null,
      action:actionData,
      oldData:old,
      newData:news,
      userId:userId || null,
    });

    await this.auditLogRepository.save(log);
  }

  async findLogs(
    tableName?: string, 
    action?: string, 
    userId?: number, 
    entityId?: number
  ): Promise<AuditLog[]> {
    const logs = await this.auditLogRepository.createQueryBuilder('log')
      .leftJoin('log.user', 'user')
      .leftJoin('user.direction', 'direction')
      .addSelect([
        'user.id',
        'user.nom',
        'user.prenom',
        'user.postnom',
        'user.sexe'
      ])
      .addSelect([
        'direction.id',
        'direction.direction',
        'direction.directionGeneraleId'
      ])
      .where(tableName ? 'log.tableName = :tableName' : '1=1', { tableName })
      .andWhere(action ? 'log.action = :action' : '1=1', { action })
      .andWhere('log.action != :createAction', { createAction: 'CREATE' })
      .andWhere(entityId ? 'log.entityId = :entityId' : '1=1', { entityId })
      .andWhere(userId ? 'log.userId = :userId' : '1=1', { userId })
      .getMany();
  
    // Nettoyer les données avant retour
    return logs.map(log => ({
      ...log,
      newData: this.cleanData(log.newData),
      oldData: this.cleanData(log.oldData)
    }));
  }
  
  /**
   * Nettoie un objet en supprimant les propriétés null/undefined
   * et en convertissant les objets JSON stringifiés en objets
   */
  private cleanData(data: any): any {
    if (!data) return null;
    
    // Si c'est une string, tente de la parser en JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return data;
      }
    }
  
    if (typeof data !== 'object') return data;
  
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  // Trouver un log par ID
  async findLogById(id: number): Promise<AuditLog> {
    return await this.auditLogRepository.findOneOrFail({ where: { id } });
  }

  // Supprimer un log par ID
  async deleteLog(id: number): Promise<void> {
    await this.auditLogRepository.delete(id);
  }

  async getLogsByTable(tableName: string) {
    return this.auditLogRepository.find({ where: { tableName }, order: { createdAt: "DESC" } });
  }

  async getLogsByUser(userId: number) {
    return this.auditLogRepository.find({ where: { userId }, order: { createdAt: "DESC" } });
  }


}
