import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GoogleSheetsService } from './google-sheets.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@ApiTags('Google Sheets')
@Controller('google-sheets')
export class GoogleSheetsController {
    constructor(private readonly googleSheetsService: GoogleSheetsService) { }

    @Post('config')
    @ApiOperation({ summary: 'Create a Google Sheet config' })
    @ApiBody({ type: CreateConfigDto })
    @ApiResponse({ status: 201, description: 'Config created' })
    async createConfig(@Body() createConfigDto: CreateConfigDto) {
        return this.googleSheetsService.createConfig(createConfigDto);
    }

    @Get('config')
    async getAllConfigs() {
        return this.googleSheetsService.getAllConfigs();
    }

    @Get('config/:id')
    @ApiOperation({ summary: 'Get a Google Sheet config by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Return the config' })
    async getConfig(@Param('id') id: number) {
        return this.googleSheetsService.getConfig(id);
    }

    @Put('config/:id')
    @ApiOperation({ summary: 'Update a Google Sheet config' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateConfigDto })
    @ApiResponse({ status: 200, description: 'Config updated' })
    async updateConfig(@Param('id') id: number, @Body() updateConfigDto: UpdateConfigDto) {
        return this.googleSheetsService.updateConfig(id, updateConfigDto);
    }

    @Delete('config/:id')
    @ApiOperation({ summary: 'Delete a Google Sheet config' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Config deleted' })
    async deleteConfig(@Param('id') id: number) {
        return this.googleSheetsService.deleteConfig(id);
    }

    @Post('sync/:id')
    @ApiOperation({ summary: 'Trigger manual sync for a config' })
    @ApiParam({ name: 'id', type: Number })
    async manualSync(@Param('id') id: number) {
        return this.googleSheetsService.triggerSync(id);
    }

    @Post('sync-all')
    @ApiOperation({ summary: 'Trigger manual sync for all configs' })
    async manualSyncAll() {
        return this.googleSheetsService.syncAllConfigs();
    }

    @Get('logs')
    async getSyncLogs() {
        return this.googleSheetsService.getSyncLogs();
    }

    @Get('budget-data')
    async getBudgetData() {
        return this.googleSheetsService.getBudgetData();
    }

    @Post('auto-detect/:id')
    @ApiOperation({ summary: 'Auto-detect mapping and sync for a config' })
    @ApiParam({ name: 'id', type: Number })
    async autoDetect(@Param('id') id: number) {
        return this.googleSheetsService.autoDetectAndSync(id);
    }

    @Get('audit-logs')
    async getAuditLogs() {
        return this.googleSheetsService.getAuditLogs();
    }

    @Get('departments')
    async getDepartments() {
        return this.googleSheetsService.getDepartments();
    }

    @Get('activities')
    async getActivities(@Query('department') department: string) {
        return this.googleSheetsService.getActivities(department);
    }

    @Post('repair-transactions-centre')
    async repiarTransactionCentre() {
        return this.googleSheetsService.repiarTransactionCentre();
    }
}
