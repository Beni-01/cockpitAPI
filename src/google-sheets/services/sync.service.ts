import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleSheetConfig } from '../entities/google-sheet-config.entity';
import { SheetReaderService } from './sheet-reader.service';
import { DataTransformerService } from './data-transformer.service';
import { Activity } from '../../activity/entities/activity.entity';
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
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
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
            where: { isActive: true },
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

            if (!config.isActive) {
                throw new Error(`Configuration ${configId} is not active`);
            }

            this.logger.log(`Starting sync for: ${config.name}`);

            // Emit sync started event
            this.eventEmitter.emit('sheet.sync.started', { configId, config });

            // Read data from sheet
            const sheetData = await this.sheetReaderService.readSheetWithHeaders(
                config.spreadsheetId,
                config.range,
            );

            if (!sheetData || sheetData.length === 0) {
                this.logger.warn(`No data found in sheet for config ${configId}`);
                return this.createSyncResult(configId, startTime, {
                    success: true,
                    recordsProcessed: 0,
                    recordsCreated: 0,
                    recordsUpdated: 0,
                    recordsSkipped: 0,
                    errors: ['No data found in sheet'],
                });
            }

            // Transform and sync data
            const result = await this.transformAndSyncData(config, sheetData);

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
                // Transform row data to activity entity
                const activityData = this.dataTransformerService.transformToActivity(
                    row,
                    config.columnMapping,
                );

                // Validate data
                const validation = this.dataTransformerService.validateActivityData(
                    activityData,
                );

                if (!validation.valid) {
                    errors.push(
                        `Row validation failed: ${validation.errors.join(', ')}`,
                    );
                    recordsSkipped++;
                    continue;
                }

                // Check if activity already exists (by external ID or title)
                const existingActivity = await this.findExistingActivity(
                    activityData,
                    config,
                );

                if (existingActivity) {
                    // Update existing activity
                    Object.assign(existingActivity, activityData);
                    await this.activityRepository.save(existingActivity);
                    recordsUpdated++;
                } else {
                    // Create new activity
                    const newActivity = this.activityRepository.create(activityData);
                    await this.activityRepository.save(newActivity);
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
     * Find existing activity
     */
    private async findExistingActivity(
        activityData: Partial<Activity>,
        config: GoogleSheetConfig,
    ): Promise<Activity | null> {
        // Try to find by title and direction (assuming unique combination)
        if (activityData.titre && activityData.direction) {
            const activity = await this.activityRepository.findOne({
                where: {
                    titre: activityData.titre,
                    direction: activityData.direction,
                },
            });
            if (activity) return activity;
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
}
