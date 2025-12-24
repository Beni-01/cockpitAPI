import {
    Processor, Process, OnQueueActive, OnQueueCompleted,
    OnQueueFailed
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SyncService } from './sync.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SyncJobData {
    configId: number;
    userId?: number;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    retryCount?: number;
}

@Processor('sync-queue')
export class SyncProcessor {
    private readonly logger = new Logger(SyncProcessor.name);

    constructor(
        private readonly syncService: SyncService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    @Process('sync-sheet')
    async handleSync(job: Job<SyncJobData>) {
        const { configId, userId, priority } = job.data;

        this.logger.log(
            `Processing sync job ${job.id} for config ${configId} (Priority: ${priority || 'normal'})`
        );

        try {
            // Execute sync
            const result = await this.syncService.syncSheet(configId);

            // Emit success event
            this.eventEmitter.emit('sync.completed', {
                configId,
                userId,
                jobId: job.id,
                result,
            });

            return result;
        } catch (error) {
            this.logger.error(
                `Sync job ${job.id} failed for config ${configId}: ${error.message}`,
                error.stack
            );

            // Emit failure event
            this.eventEmitter.emit('sync.failed', {
                configId,
                userId,
                jobId: job.id,
                error: error.message,
            });

            throw error;
        }
    }

    @Process('bulk-sync')
    async handleBulkSync(job: Job<{ configIds: number[] }>) {
        const { configIds } = job.data;

        this.logger.log(`Processing bulk sync job ${job.id} for ${configIds.length} configs`);

        const results = await Promise.allSettled(
            configIds.map(configId => this.syncService.syncSheet(configId))
        );

        const summary = {
            total: configIds.length,
            successful: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length,
        };

        this.logger.log(
            `Bulk sync job ${job.id} completed: ${summary.successful}/${summary.total} successful`
        );

        return summary;
    }

    @Process('scheduled-sync')
    async handleScheduledSync(job: Job<{ configId: number }>) {
        const { configId } = job.data;

        this.logger.log(`Processing scheduled sync for config ${configId}`);

        return this.syncService.syncSheet(configId);
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.log(`Job ${job.id} (${job.name}) started processing`);
    }

    @OnQueueCompleted()
    onCompleted(job: Job, result: any) {
        this.logger.log(
            `Job ${job.id} (${job.name}) completed successfully. ` +
            `Records processed: ${result.recordsProcessed || 0}`
        );
    }

    @OnQueueFailed()
    onFailed(job: Job, error: Error) {
        this.logger.error(
            `Job ${job.id} (${job.name}) failed: ${error.message}`,
            error.stack
        );
    }
}
