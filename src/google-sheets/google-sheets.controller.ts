import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('google-sheets')
export class GoogleSheetsController {
    constructor(private readonly googleSheetsService: GoogleSheetsService) { }

    @Post('config')
    async createConfig(@Body() createConfigDto: CreateConfigDto) {
        return this.googleSheetsService.createConfig(createConfigDto);
    }

    @Get('config')
    async getAllConfigs() {
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

    @Post('sync/:id')
    async manualSync(@Param('id') id: number) {
        return this.googleSheetsService.triggerSync(id);
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
}
