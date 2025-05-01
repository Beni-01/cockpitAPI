import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  async createAuditLog(@Body() createAuditLogDto: CreateAuditLogDto) {
    const { tableName, entityId, action, oldData, newData, userId } = createAuditLogDto;

    // Call the service method to log the audit
    await this.auditLogService.log(tableName, entityId, action, oldData, newData, userId);

    return {
      message: 'Audit log created successfully',
    };
  }


  @Get('log')
  async getLogs(@Query('table') tableName?: string, @Query('userId') userId?: number) {
    if (tableName) {
      return this.auditLogService.getLogsByTable(tableName);
    }
    if (userId) {
      return this.auditLogService.getLogsByUser(userId);
    }
    return [];
  }

  // Récupérer tous les logs d'audit
  @Get()
  async findAll(
    @Query('table') tableName?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ): Promise<AuditLog[]> {
    return await this.auditLogService.findLogs(tableName, action, +userId);
  }

  // Récupérer les logs par ID
  @Get('getLogById/:id')
  async findOne(@Param('id') id: number): Promise<AuditLog> {
    return await this.auditLogService.findLogById(id);
  }

  // Supprimer un log par ID
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return await this.auditLogService.deleteLog(id);
  }
}
