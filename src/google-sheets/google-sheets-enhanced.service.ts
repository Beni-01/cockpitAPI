import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GoogleSheetConfig } from './entities/google-sheet-config.entity';
import { SyncLog } from './entities/sync-log.entity';
import { BudgetData } from './entities/budget-data.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { PaginationDto, PaginatedResponse } from './dto/pagination.dto';
import { SyncService } from './services/sync.service';
import { AutoDetectionService } from './services/auto-detection.service';
import { GoogleAuthService } from './services/google-auth.service';
import { CacheService } from './services/cache.service';
import { QueueService } from './services/queue.service';
import { RollbackService } from './services/rollback.service';
import { DataValidationService } from './services/data-validation.service';

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
        private cacheService: CacheService,
        private queueService: QueueService,
        private rollbackService: RollbackService,
        private dataValidationService: DataValidationService,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async createConfig(createConfigDto: CreateConfigDto): Promise<GoogleSheetConfig> {
        const sheetId = this.extractSheetId(createConfigDto.sheet_url);

        const config = this.configRepository.create({
            ...createConfigDto,
            sheet_id: sheetId,
            created_by: 1,
        });

        const saved = await this.configRepository.save(config);

        // Invalidate cache
        await this.cacheService.invalidateConfigCache();

        return saved;
    }

    async getAllConfigs(pagination?: PaginationDto): Promise<PaginatedResponse<GoogleSheetConfig> | GoogleSheetConfig[]> {
        // If no pagination, return all (with caching)
        if (!pagination) {
            return this.cacheService.getOrSet(
                this.cacheService.getConfigKey(),
                () => this.configRepository.find({ order: { created_at: 'DESC' } }),
                300 // 5 minutes
            );
        }

        // With pagination
        const { skip, limit, page } = pagination;

        const [data, total] = await this.configRepository.findAndCount({
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }

    async getConfig(id: number): Promise<GoogleSheetConfig> {
        return this.cacheService.getOrSet(
            this.cacheService.getConfigKey(id),
            async () => {
                const config = await this.configRepository.findOne({ where: { id } });
                if (!config) {
                    throw new NotFoundException('Configuration not found');
                }
                return config;
            },
            300
        );
    }

    async updateConfig(id: number, updateConfigDto: UpdateConfigDto): Promise<GoogleSheetConfig> {
        const config = await this.getConfig(id);

        if (updateConfigDto.sheet_url) {
            const sheetId = this.extractSheetId(updateConfigDto.sheet_url);
            Object.assign(config, updateConfigDto, { sheet_id: sheetId });
        } else {
            Object.assign(config, updateConfigDto);
        }

        const updated = await this.configRepository.save(config);

        // Invalidate cache
        await this.cacheService.invalidateConfigCache(id);

        return updated;
    }

    async deleteConfig(id: number): Promise<void> {
        const result = await this.configRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException('Configuration not found');
        }

        // Invalidate cache
        await this.cacheService.invalidateConfigCache(id);

        // Delete snapshots
        await this.rollbackService.deleteSnapshotsForConfig(id);
    }

    private extractSheetId(url: string): string {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : url;
    }

    async triggerSync(id: number, priority?: 'low' | 'normal' | 'high' | 'critical'): Promise<any> {
        const config = await this.getConfig(id);

        // Queue the sync instead of running synchronously
        const job = await this.queueService.addSyncJob(id, { priority });

        return {
            message: 'Sync queued successfully',
            configId: id,
            jobId: job.jobId,
            status: job.status,
        };
    }

    async getSyncLogs(pagination?: PaginationDto): Promise<PaginatedResponse<SyncLog> | SyncLog[]> {
        if (!pagination) {
            return this.cacheService.getOrSet(
                this.cacheService.getSyncLogsKey(),
                () => this.syncLogRepository.find({
                    relations: ['config'],
                    order: { started_at: 'DESC' },
                    take: 50,
                }),
                60 // 1 minute
            );
        }

        const { skip, limit, page } = pagination;

        const [data, total] = await this.syncLogRepository.findAndCount({
            relations: ['config'],
            order: { started_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }

    async getBudgetData(pagination?: PaginationDto): Promise<PaginatedResponse<BudgetData> | BudgetData[]> {
        if (!pagination) {
            return this.cacheService.getOrSet(
                this.cacheService.getBudgetDataKey(),
                () => this.budgetDataRepository.find({
                    order: { last_synced_at: 'DESC' },
                    take: 50,
                }),
                120 // 2 minutes
            );
        }

        const { skip, limit, page } = pagination;

        const [data, total] = await this.budgetDataRepository.findAndCount({
            order: { last_synced_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
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

        // Validate column mapping
        const validationResult = this.dataValidationService.validateColumnMapping(
            structure.suggestedMapping
        );

        if (!validationResult.isValid) {
            return {
                message: 'Auto-detection completed with errors',
                errors: validationResult.errors,
                warnings: validationResult.warnings,
            };
        }

        // Update config with detected mapping
        config.columnMapping = structure.suggestedMapping;
        config.range = `${config.worksheet_name}!A${structure.dataStartRow}:Z`;
        await this.configRepository.save(config);

        // Invalidate cache
        await this.cacheService.invalidateConfigCache(id);

        // Trigger sync via queue
        const job = await this.queueService.addSyncJob(id, { priority: 'high' });

        return {
            message: 'Auto-detection completed and sync queued',
            structure: {
                headers: structure.headers,
                mapping: structure.suggestedMapping,
                dataStartRow: structure.dataStartRow,
            },
            validation: validationResult,
            syncJob: job,
        };
    }

    async getAuditLogs(pagination?: PaginationDto): Promise<any> {
        const query = `
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
            ${pagination ? `LIMIT ${pagination.limit} OFFSET ${pagination.skip}` : 'LIMIT 100'}
        `;

        if (!pagination) {
            return this.cacheService.getOrSet(
                this.cacheService.getAuditLogsKey(),
                () => this.budgetDataRepository.manager.query(query),
                60
            );
        }

        const data = await this.budgetDataRepository.manager.query(query);

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM budget_data_change_log l
            JOIN budget_data b ON l.budget_data_id = b.id
            JOIN google_sheet_config c ON b.config_id = c.id
        `;
        const [{ total }] = await this.budgetDataRepository.manager.query(countQuery);

        return {
            data,
            meta: {
                total: parseInt(total),
                page: pagination.page,
                limit: pagination.limit,
                totalPages: Math.ceil(total / pagination.limit),
                hasNextPage: pagination.page * pagination.limit < total,
                hasPreviousPage: pagination.page > 1,
            },
        };
    }

    async getDepartments(): Promise<string[]> {
        return this.cacheService.getOrSet(
            this.cacheService.getDepartmentsKey(),
            async () => {
                const result = await this.dataSource.query(
                    'SELECT DISTINCT department FROM master_data_hierarchy ORDER BY department'
                );
                return result.map((row: any) => row.department);
            },
            3600 // 1 hour
        );
    }

    async getActivities(department: string): Promise<string[]> {
        return this.cacheService.getOrSet(
            this.cacheService.getActivitiesKey(department),
            async () => {
                const result = await this.dataSource.query(
                    'SELECT DISTINCT activity FROM master_data_hierarchy WHERE department = ? ORDER BY activity',
                    [department]
                );
                return result.map((row: any) => row.activity);
            },
            1800 // 30 minutes
        );
    }

    // Rollback methods
    async getSnapshots(configId: number) {
        return this.rollbackService.getSnapshots(configId);
    }

    async getSnapshotDetails(snapshotId: number) {
        return this.rollbackService.getSnapshotDetails(snapshotId);
    }

    async rollbackToSnapshot(snapshotId: number) {
        const result = await this.rollbackService.rollback(snapshotId);

        if (result.success) {
            // Invalidate cache after rollback
            await this.cacheService.invalidateSyncCache(result.configId);
        }

        return result;
    }

    async compareWithSnapshot(snapshotId: number) {
        return this.rollbackService.compareWithSnapshot(snapshotId);
    }

    // Queue management methods
    async getQueueStats() {
        return this.queueService.getQueueStats();
    }

    async getJobStatus(jobId: string) {
        return this.queueService.getJobStatus(jobId);
    }

    async retryJob(jobId: string) {
        return this.queueService.retryJob(jobId);
    }

    async cancelJob(jobId: string) {
        return this.queueService.cancelJob(jobId);
    }

    // Bulk operations
    async bulkSync(configIds: number[]) {
        return this.queueService.addBulkSyncJob(configIds);
    }

    // Data validation
    async validateSheetData(configId: number, data: any[]) {
        return this.dataValidationService.validateBatch(data);
    }
}
