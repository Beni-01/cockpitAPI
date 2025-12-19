import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
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
}
