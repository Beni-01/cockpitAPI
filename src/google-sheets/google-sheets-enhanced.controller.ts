import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets-enhanced.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('google-sheets')
export class GoogleSheetsController {
    constructor(private readonly googleSheetsService: GoogleSheetsService) { }

    // ==================== CONFIG MANAGEMENT ====================

    @Post('config')
    async createConfig(@Body() createConfigDto: CreateConfigDto) {
        return this.googleSheetsService.createConfig(createConfigDto);
    }

    @Get('config')
    async getAllConfigs(@Query() pagination: PaginationDto) {
        // If page or limit is provided, use pagination
        if (pagination.page || pagination.limit) {
            return this.googleSheetsService.getAllConfigs(pagination);
        }
        return this.googleSheetsService.getAllConfigs();
    }

    @Get('config/:id')
    async getConfig(@Param('id') id: number) {
        return this.googleSheetsService.getConfig(id);
    }

    @Put('config/:id')
    async updateConfig(@Param('id') id: number, @Body() updateConfigDto: UpdateConfigDto) {
        return this.googleSheetsService.updateConfig(id, updateConfigDto);
    }

    @Delete('config/:id')
    async deleteConfig(@Param('id') id: number) {
        return this.googleSheetsService.deleteConfig(id);
    }

    // ==================== SYNC OPERATIONS ====================

    @Post('sync/:id')
    async manualSync(
        @Param('id') id: number,
        @Query('priority') priority?: 'low' | 'normal' | 'high' | 'critical'
    ) {
        return this.googleSheetsService.triggerSync(id, priority);
    }

    @Post('sync/bulk')
    async bulkSync(@Body() body: { configIds: number[] }) {
        return this.googleSheetsService.bulkSync(body.configIds);
    }

    @Get('sync/job/:jobId')
    async getJobStatus(@Param('jobId') jobId: string) {
        return this.googleSheetsService.getJobStatus(jobId);
    }

    @Post('sync/job/:jobId/retry')
    async retryJob(@Param('jobId') jobId: string) {
        return this.googleSheetsService.retryJob(jobId);
    }

    @Delete('sync/job/:jobId')
    async cancelJob(@Param('jobId') jobId: string) {
        return this.googleSheetsService.cancelJob(jobId);
    }

    @Get('sync/queue/stats')
    async getQueueStats() {
        return this.googleSheetsService.getQueueStats();
    }

    // ==================== LOGS & DATA ====================

    @Get('logs')
    async getSyncLogs(@Query() pagination: PaginationDto) {
        if (pagination.page || pagination.limit) {
            return this.googleSheetsService.getSyncLogs(pagination);
        }
        return this.googleSheetsService.getSyncLogs();
    }

    @Get('budget-data')
    async getBudgetData(@Query() pagination: PaginationDto) {
        if (pagination.page || pagination.limit) {
            return this.googleSheetsService.getBudgetData(pagination);
        }
        return this.googleSheetsService.getBudgetData();
    }

    @Get('audit-logs')
    async getAuditLogs(@Query() pagination: PaginationDto) {
        if (pagination.page || pagination.limit) {
            return this.googleSheetsService.getAuditLogs(pagination);
        }
        return this.googleSheetsService.getAuditLogs();
    }

    // ==================== AUTO-DETECTION ====================

    @Post('auto-detect/:id')
    async autoDetect(@Param('id') id: number) {
        return this.googleSheetsService.autoDetectAndSync(id);
    }

    // ==================== MASTER DATA ====================

    @Get('departments')
    async getDepartments() {
        return this.googleSheetsService.getDepartments();
    }

    @Get('activities')
    async getActivities(@Query('department') department: string) {
        return this.googleSheetsService.getActivities(department);
    }

    // ==================== ROLLBACK ====================

    @Get('snapshots/:configId')
    async getSnapshots(@Param('configId') configId: number) {
        return this.googleSheetsService.getSnapshots(configId);
    }

    @Get('snapshot/:snapshotId')
    async getSnapshotDetails(@Param('snapshotId') snapshotId: number) {
        return this.googleSheetsService.getSnapshotDetails(snapshotId);
    }

    @Post('rollback/:snapshotId')
    async rollback(@Param('snapshotId') snapshotId: number) {
        return this.googleSheetsService.rollbackToSnapshot(snapshotId);
    }

    @Get('snapshot/:snapshotId/compare')
    async compareWithSnapshot(@Param('snapshotId') snapshotId: number) {
        return this.googleSheetsService.compareWithSnapshot(snapshotId);
    }

    // ==================== DATA VALIDATION ====================

    @Post('validate/:configId')
    async validateData(
        @Param('configId') configId: number,
        @Body() body: { data: any[] }
    ) {
        return this.googleSheetsService.validateSheetData(configId, body.data);
    }
}
