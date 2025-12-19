import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleSheetConfig } from './entities/google-sheet-config.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class GoogleSheetsService {
    constructor(
        @InjectRepository(GoogleSheetConfig)
        private configRepository: Repository<GoogleSheetConfig>,
    ) { }

    async createConfig(createConfigDto: CreateConfigDto): Promise<GoogleSheetConfig> {
        const sheetId = this.extractSheetId(createConfigDto.sheet_url);

        const config = this.configRepository.create({
            ...createConfigDto,
            sheet_id: sheetId,
            created_by: 1,
        });

        return this.configRepository.save(config);
    }

    async getAllConfigs(): Promise<GoogleSheetConfig[]> {
        return this.configRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    async getConfig(id: number): Promise<GoogleSheetConfig> {
        const config = await this.configRepository.findOne({ where: { id } });

        if (!config) {
            throw new NotFoundException('Configuration not found');
        }

        return config;
    }

    async updateConfig(id: number, updateConfigDto: UpdateConfigDto): Promise<GoogleSheetConfig> {
        const config = await this.getConfig(id);

        if (updateConfigDto.sheet_url) {
            const sheetId = this.extractSheetId(updateConfigDto.sheet_url);
            Object.assign(config, updateConfigDto, { sheet_id: sheetId });
        } else {
            Object.assign(config, updateConfigDto);
        }

        return this.configRepository.save(config);
    }

    async deleteConfig(id: number): Promise<void> {
        const result = await this.configRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException('Configuration not found');
        }
    }

    private extractSheetId(url: string): string {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : url;
    }
}
