import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleSheetConfig } from '../entities/google-sheet-config.entity';
import { BudgetData } from '../entities/budget-data.entity';
import { SyncLog } from '../entities/sync-log.entity';
import { BudgetDataChangeLog } from '../entities/budget-data-change-log.entity';
import { SheetReaderService } from './sheet-reader.service';
import { DataTransformerService } from './data-transformer.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface SyncResult {
    configId: number;
    success: boolean;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsSkipped: number;
    errors: string[];
    startTime: Date;
    endTime: Date;
    duration: number;
}

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);
    private syncInProgress = new Map<number, boolean>();

    constructor(
        @InjectRepository(GoogleSheetConfig)
        private sheetConfigRepository: Repository<GoogleSheetConfig>,
        @InjectRepository(BudgetData)
        private budgetDataRepository: Repository<BudgetData>,
        @InjectRepository(SyncLog)
        private syncLogRepository: Repository<SyncLog>,
        @InjectRepository(BudgetDataChangeLog)
        private changeLogRepository: Repository<BudgetDataChangeLog>,
        private sheetReaderService: SheetReaderService,
        private dataTransformerService: DataTransformerService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Scheduled sync - runs every 15 minutes
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async scheduledSync() {
        this.logger.log('Starting scheduled sync...');

        const activeConfigs = await this.sheetConfigRepository.find({
            where: { is_active: true },
        });
        for (const config of activeConfigs) {
            try {
                await this.syncSheet(config.id);
            } catch (error) {
                this.logger.error(
                    `Scheduled sync failed for config ${config.id}`,
                    error,
                );
            }
        }

        this.logger.log('Scheduled sync completed');
    }

    /**
     * Sync a specific sheet configuration
     */
    async syncSheet(configId: number): Promise<SyncResult> {
        const startTime = new Date();
        let syncLog: SyncLog | null = null;

        // Check if sync is already in progress
        if (this.syncInProgress.get(configId)) {
            this.logger.warn(`Sync already in progress for config ${configId}`);
            throw new Error('Sync already in progress');
        }

        this.syncInProgress.set(configId, true);

        try {
            // Get configuration
            const config = await this.sheetConfigRepository.findOne({
                where: { id: configId },
            });

            if (!config) {
                throw new Error(`Configuration ${configId} not found`);
            }

            if (!config.is_active) {
                throw new Error(`Configuration ${configId} is not active`);
            }

            this.logger.log(`Starting sync for: ${config.name}`);

            // Create sync log entry
            syncLog = this.syncLogRepository.create({
                config_id: configId,
                trigger_source: 'polling',
                status: 'in_progress',
                started_at: startTime,
            });
            await this.syncLogRepository.save(syncLog);

            // Emit sync started event
            this.eventEmitter.emit('sheet.sync.started', { configId, config });

            // Read data from sheet
            const range = config.range || config.worksheet_name;
            const sheetData = await this.sheetReaderService.readSheetWithHeaders(
                config.spreadsheetId,
                range,
            );
            console.log("sheetData", sheetData[10])

            if (!sheetData || sheetData.length === 0) {
                this.logger.warn(`No data found in sheet for config ${configId}`);

                // Update sync log before returning
                if (syncLog) {
                    syncLog.status = 'success';
                    syncLog.records_fetched = 0;
                    syncLog.records_inserted = 0;
                    syncLog.records_updated = 0;
                    syncLog.records_skipped = 0;
                    syncLog.error_message = 'No data found in sheet';
                    syncLog.completed_at = new Date();
                    await this.syncLogRepository.save(syncLog);
                }

                // Update config
                config.lastSyncAt = new Date();
                config.lastSyncStatus = 'success';
                config.lastSyncMessage = 'No data found in sheet';
                await this.sheetConfigRepository.save(config);

                const endTime = new Date();
                const syncResult = this.createSyncResult(configId, startTime, {
                    success: true,
                    recordsProcessed: 0,
                    recordsCreated: 0,
                    recordsUpdated: 0,
                    recordsSkipped: 0,
                    errors: ['No data found in sheet'],
                    endTime,
                });

                // Emit sync completed event
                this.eventEmitter.emit('sheet.sync.completed', syncResult);

                return syncResult;
            }
            // Transform and sync data
            const result = await this.transformAndSyncData(config, sheetData, syncLog);

            // Update sync log with results
            if (syncLog) {
                syncLog.status = result.success ? 'success' : 'failed';
                syncLog.records_fetched = result.recordsProcessed;
                syncLog.records_inserted = result.recordsCreated;
                syncLog.records_updated = result.recordsUpdated;
                syncLog.records_skipped = result.recordsSkipped;
                syncLog.error_message = result.errors.join('; ') || null;
                syncLog.completed_at = new Date();
                await this.syncLogRepository.save(syncLog);
            }

            // Update last sync time
            config.lastSyncAt = new Date();
            config.lastSyncStatus = result.success ? 'success' : 'error';
            config.lastSyncMessage = result.errors.join('; ') || 'Sync completed successfully';
            await this.sheetConfigRepository.save(config);

            const endTime = new Date();
            const syncResult = this.createSyncResult(configId, startTime, {
                ...result,
                endTime,
            });

            // Emit sync completed event
            this.eventEmitter.emit('sheet.sync.completed', syncResult);

            this.logger.log(
                `Sync completed for config ${configId}: ${result.recordsCreated} created, ${result.recordsUpdated} updated`,
            );

            return syncResult;
        } catch (error) {
            this.logger.error(`Sync failed for config ${configId}`, error);

            // Update sync log with error
            if (syncLog) {
                syncLog.status = 'failed';
                syncLog.error_message = error.message;
                syncLog.completed_at = new Date();
                await this.syncLogRepository.save(syncLog);
            }

            const endTime = new Date();
            const syncResult = this.createSyncResult(configId, startTime, {
                success: false,
                recordsProcessed: 0,
                recordsCreated: 0,
                recordsUpdated: 0,
                recordsSkipped: 0,
                errors: [error.message],
                endTime,
            });

            // Emit sync failed event
            this.eventEmitter.emit('sheet.sync.failed', syncResult);

            throw error;
        } finally {
            this.syncInProgress.set(configId, false);
        }
    }

    /**
     * Transform and sync data to database
     */
    private async transformAndSyncData(
        config: GoogleSheetConfig,
        sheetData: any[],
        syncLog?: SyncLog,
    ): Promise<{
        success: boolean;
        recordsProcessed: number;
        recordsCreated: number;
        recordsUpdated: number;
        recordsSkipped: number;
        errors: string[];
    }> {
        let recordsCreated = 0;
        let recordsUpdated = 0;
        let recordsSkipped = 0;
        const errors: string[] = [];

        for (const row of sheetData) {
            try {
                // Transform row data to budget data entity
                const budgetData = this.dataTransformerService.transformToBudgetData(
                    row,
                    config.columnMapping,
                );

                // Validate data
                const validation = this.dataTransformerService.validateBudgetData(
                    budgetData,
                );

                if (!validation.valid) {
                    errors.push(
                        `Row validation failed: ${validation.errors.join(', ')}`,
                    );
                    recordsSkipped++;
                    continue;
                }

                // Check if budget data already exists (by external ID or project name)
                const existingBudget = await this.findExistingBudgetData(
                    budgetData,
                    config.id,
                );

                if (existingBudget) {
                    // Detect changes before updating
                    const changes = await this.detectChanges(existingBudget, budgetData, config.id, syncLog?.id);

                    // Update existing budget data
                    Object.assign(existingBudget, budgetData);
                    existingBudget.last_synced_at = new Date();
                    await this.budgetDataRepository.save(existingBudget);

                    // Log the changes
                    if (changes.length > 0) {
                        await this.changeLogRepository.save(changes);
                        this.logger.log(`Updated budget ${existingBudget.id}: ${changes.length} fields changed`);
                    }

                    recordsUpdated++;
                } else {
                    // Create new budget data
                    const newBudget = this.budgetDataRepository.create({
                        ...budgetData,
                        config_id: config.id,
                        synced_from_sheet: true,
                        last_synced_at: new Date(),
                    });
                    await this.budgetDataRepository.save(newBudget);
                    recordsCreated++;
                }
            } catch (error) {
                errors.push(`Row processing error: ${error.message}`);
                recordsSkipped++;
            }
        }

        return {
            success: errors.length === 0 || recordsCreated + recordsUpdated > 0,
            recordsProcessed: sheetData.length,
            recordsCreated,
            recordsUpdated,
            recordsSkipped,
            errors,
        };
    }

    /**
 * Find existing budget data
 */
    private async findExistingBudgetData(
        budgetData: Partial<BudgetData>,
        configId: number,
    ): Promise<BudgetData | null> {
        // Try to find by external_id and config_id first
        if (budgetData.external_id) {
            const existing = await this.budgetDataRepository.findOne({
                where: {
                    external_id: budgetData.external_id,
                    config_id: configId,
                },
            });
            if (existing) return existing;
        }

        // Try to find by project_name, budget_category and config_id
        if (budgetData.project_name && budgetData.budget_category) {
            const existing = await this.budgetDataRepository.findOne({
                where: {
                    project_name: budgetData.project_name,
                    budget_category: budgetData.budget_category,
                    config_id: configId,
                },
            });
            if (existing) return existing;
        }

        // Try to find by project_name and config_id only
        if (budgetData.project_name) {
            const existing = await this.budgetDataRepository.findOne({
                where: {
                    project_name: budgetData.project_name,
                    config_id: configId,
                },
            });
            if (existing) return existing;
        }

        return null;
    }

    /**
     * Create sync result object
     */
    private createSyncResult(
        configId: number,
        startTime: Date,
        data: any,
    ): SyncResult {
        const endTime = data.endTime || new Date();
        return {
            configId,
            startTime,
            endTime,
            duration: endTime.getTime() - startTime.getTime(),
            ...data,
        };
    }

    /**
     * Manual sync trigger
     */
    async triggerManualSync(configId: number): Promise<SyncResult> {
        this.logger.log(`Manual sync triggered for config ${configId}`);
        return this.syncSheet(configId);
    }

    /**
     * Sync all active configurations
     */
    async syncAll(): Promise<SyncResult[]> {
        const activeConfigs = await this.sheetConfigRepository.find({
            where: { isActive: true },
        });

        const results: SyncResult[] = [];

        for (const config of activeConfigs) {
            try {
                const result = await this.syncSheet(config.id);
                results.push(result);
            } catch (error) {
                this.logger.error(`Sync failed for config ${config.id}`, error);
            }
        }

        return results;
    }

    /**
     * Get sync status for a configuration
     */
    async getSyncStatus(configId: number): Promise<{
        inProgress: boolean;
        lastSync: Date | null;
        lastStatus: string | null;
    }> {
        const config = await this.sheetConfigRepository.findOne({
            where: { id: configId },
        });

        return {
            inProgress: this.syncInProgress.get(configId) || false,
            lastSync: config?.lastSyncAt || null,
            lastStatus: config?.lastSyncStatus || null,
        };
    }

    /**
     * Detect changes between existing and new budget data
     */
    private async detectChanges(
        existing: BudgetData,
        newData: Partial<BudgetData>,
        configId: number,
        syncLogId?: number,
    ): Promise<BudgetDataChangeLog[]> {
        const changes: BudgetDataChangeLog[] = [];

        // Fields to track for changes
        const fieldsToTrack = [
            'project_name',
            'budget_category',
            'allocated_amount',
            'spent_amount',
            'remaining_amount',
            'budget_type',
            'cost_center',
            'account_code',
            'budget_period',
            'fiscal_year',
            'quarter',
            'month',
            'status',
            'approval_status',
            'notes',
            'responsible_person',
            'province',
            'territory',
        ];

        for (const field of fieldsToTrack) {
            const oldValue = existing[field];
            const newValue = newData[field];

            // Check if value actually changed
            if (newValue !== undefined && oldValue !== newValue) {
                const changeLog = this.changeLogRepository.create({
                    budget_data_id: existing.id,
                    config_id: configId,
                    field_name: field,
                    old_value: oldValue != null ? String(oldValue) : null,
                    new_value: newValue != null ? String(newValue) : null,
                    changed_by: 'sync',
                    sync_log_id: syncLogId,
                });

                changes.push(changeLog);
            }
        }

        return changes;
    }
}
