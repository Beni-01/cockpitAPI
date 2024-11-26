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
    performedBy: number,
  ) {
    const log = this.auditLogRepository.create({
      tableName,
      entityId,
      action,
      oldData,
      newData,
      performedBy,
    });
    await this.auditLogRepository.save(log);
  }
}
