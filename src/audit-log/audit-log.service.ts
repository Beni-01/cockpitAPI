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
    tableName: string,
    entityId: number,
    action: string,
    oldData: any,
    newData: any,
    userId: number,
  ) {
    const log = this.auditLogRepository.create({
      tableName,
      entityId,
      action,
      oldData,
      newData,
      userId,
    });

    await this.auditLogRepository.save(log);
  }

  // Trouver tous les logs avec filtres optionnels
  async findLogs(tableName?: string, action?: string, userId?:number): Promise<AuditLog[]> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');

    if (tableName) {
      queryBuilder.andWhere('log.tableName = :tableName', { tableName });
    }
    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    return await queryBuilder.getMany();
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
