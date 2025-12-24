import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GoogleSheetConfig } from './entities/google-sheet-config.entity';
import { SyncLog } from './entities/sync-log.entity';
import { BudgetData } from './entities/budget-data.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { SyncService } from './services/sync.service';
import { AutoDetectionService } from './services/auto-detection.service';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable()
export class GoogleSheetsService {
    constructor(
        @InjectRepository(GoogleSheetConfig)
        private configRepository: Repository<GoogleSheetConfig>,
        @InjectRepository(SyncLog)
        private syncLogRepository: Repository<SyncLog>,
        @InjectRepository(BudgetData)
        private budgetDataRepository: Repository<BudgetData>,
        private syncService: SyncService,
        private autoDetectionService: AutoDetectionService,
        private googleAuthService: GoogleAuthService,
        @InjectDataSource() private dataSource: DataSource,
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

    async triggerSync(id: number): Promise<any> {
        const config = await this.getConfig(id);
        try {
            await this.syncService.syncSheet(id);
            return { message: 'Sync triggered successfully', configId: id };
        } catch (error) {
            return { message: 'Sync failed', error: error.message, configId: id };
        }
    }

    async getSyncLogs(): Promise<SyncLog[]> {
        return this.syncLogRepository.find({
            relations: ['config'],
            order: { started_at: 'DESC' },
            take: 50,
        });
    }

    async getBudgetData(): Promise<BudgetData[]> {
        return this.budgetDataRepository.find({
            order: { last_synced_at: 'DESC' },
            take: 50,
        });
    }

    async autoDetectAndSync(id: number): Promise<any> {
        const config = await this.getConfig(id);

        // Get auth
        const auth = await this.googleAuthService.getAuthClient();

        // Auto-detect structure
        const structure = await this.autoDetectionService.autoDetectSheetStructure(
            config.sheet_id,
            config.worksheet_name,
            auth,
        );

        // Update config with detected mapping
        config.columnMapping = structure.suggestedMapping;
        config.range = `${config.worksheet_name}!A${structure.dataStartRow}:Z`;
        await this.configRepository.save(config);

        // Trigger sync
        await this.syncService.syncSheet(id);

        return {
            message: 'Auto-detection and sync completed',
            structure: {
                headers: structure.headers,
                mapping: structure.suggestedMapping,
                dataStartRow: structure.dataStartRow,
            },
        };
    }

    async getAuditLogs(): Promise<any[]> {
        return this.budgetDataRepository.manager.query(`
            SELECT 
                c.name AS sheet_name,
                c.worksheet_name AS tab_name,
                l.field_name AS column_changed,
                l.old_value,
                l.new_value,
                l.changed_at
            FROM budget_data_change_log l
            JOIN budget_data b ON l.budget_data_id = b.id
            JOIN google_sheet_config c ON b.config_id = c.id
            ORDER BY l.changed_at DESC
            LIMIT 100
        `);
    }

    async getDepartments(): Promise<string[]> {
        const result = await this.dataSource.query(
            'SELECT DISTINCT department FROM master_data_hierarchy ORDER BY department'
        );
        return result.map((row: any) => row.department);
    }

    async getActivities(department: string): Promise<string[]> {
        const result = await this.dataSource.query(
            'SELECT DISTINCT activity FROM master_data_hierarchy WHERE department = ? ORDER BY activity',
            [department]
        );
        return result.map((row: any) => row.activity);
    }
}
