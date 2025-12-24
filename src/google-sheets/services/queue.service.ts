import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { SyncJobData } from '../processors/sync.processor';

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);

    constructor(
        @InjectQueue('sync-queue') private syncQueue: Queue,
    ) { }

    /**
     * Add a sync job to the queue
     */
    async addSyncJob(
        configId: number,
        options?: {
            userId?: number;
            priority?: 'low' | 'normal' | 'high' | 'critical';
            delay?: number;
        }
    ) {
        const jobData: SyncJobData = {
            configId,
            userId: options?.userId,
            priority: options?.priority || 'normal',
            retryCount: 0,
        };

        const jobOptions: JobOptions = {
            priority: this.getPriorityValue(options?.priority),
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            delay: options?.delay,
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 500,     // Keep last 500 failed jobs
        };

        const job = await this.syncQueue.add('sync-sheet', jobData, jobOptions);

        this.logger.log(
            `Sync job queued: ID ${job.id}, Config ${configId}, Priority ${options?.priority || 'normal'}`
        );

        return {
            jobId: job.id,
            configId,
            status: 'queued',
        };
    }

    /**
     * Add bulk sync job
     */
    async addBulkSyncJob(configIds: number[]) {
        const job = await this.syncQueue.add(
            'bulk-sync',
            { configIds },
            {
                attempts: 1, // Don't retry bulk jobs
                removeOnComplete: true,
            }
        );

        this.logger.log(`Bulk sync job queued: ID ${job.id}, Configs: ${configIds.length}`);

        return {
            jobId: job.id,
            configCount: configIds.length,
            status: 'queued',
        };
    }

    /**
     * Add scheduled sync job
     */
    async addScheduledSyncJob(configId: number, cronExpression: string) {
        const job = await this.syncQueue.add(
            'scheduled-sync',
            { configId },
            {
                repeat: {
                    cron: cronExpression,
                },
                removeOnComplete: true,
            }
        );

        this.logger.log(
            `Scheduled sync job created: ID ${job.id}, Config ${configId}, Cron: ${cronExpression}`
        );

        return {
            jobId: job.id,
            configId,
            schedule: cronExpression,
        };
    }

    /**
     * Get job status
     */
    async getJobStatus(jobId: string | number) {
        const job = await this.syncQueue.getJob(jobId);

        if (!job) {
            return { status: 'not_found' };
        }

        const state = await job.getState();
        const progress = job.progress();
        const failedReason = job.failedReason;

        return {
            jobId: job.id,
            status: state,
            progress,
            failedReason,
            data: job.data,
            timestamp: job.timestamp,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
            attemptsMade: job.attemptsMade,
        };
    }

    /**
     * Get queue statistics
     */
    async getQueueStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.syncQueue.getWaitingCount(),
            this.syncQueue.getActiveCount(),
            this.syncQueue.getCompletedCount(),
            this.syncQueue.getFailedCount(),
            this.syncQueue.getDelayedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed,
        };
    }

    /**
     * Get active jobs
     */
    async getActiveJobs() {
        const jobs = await this.syncQueue.getActive();
        return jobs.map(job => ({
            jobId: job.id,
            configId: job.data.configId,
            progress: job.progress(),
            timestamp: job.timestamp,
        }));
    }

    /**
     * Get failed jobs
     */
    async getFailedJobs(limit: number = 10) {
        const jobs = await this.syncQueue.getFailed(0, limit - 1);
        return jobs.map(job => ({
            jobId: job.id,
            configId: job.data.configId,
            failedReason: job.failedReason,
            timestamp: job.timestamp,
            attemptsMade: job.attemptsMade,
        }));
    }

    /**
     * Retry a failed job
     */
    async retryJob(jobId: string | number) {
        const job = await this.syncQueue.getJob(jobId);

        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        await job.retry();

        this.logger.log(`Job ${jobId} queued for retry`);

        return {
            jobId: job.id,
            status: 'retrying',
        };
    }

    /**
     * Cancel a job
     */
    async cancelJob(jobId: string | number) {
        const job = await this.syncQueue.getJob(jobId);

        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        await job.remove();

        this.logger.log(`Job ${jobId} cancelled`);

        return {
            jobId: job.id,
            status: 'cancelled',
        };
    }

    /**
     * Clean old jobs
     */
    async cleanOldJobs(grace: number = 24 * 60 * 60 * 1000) {
        await this.syncQueue.clean(grace, 'completed');
        await this.syncQueue.clean(grace * 7, 'failed'); // Keep failed jobs longer

        this.logger.log('Old jobs cleaned');
    }

    /**
     * Pause queue
     */
    async pauseQueue() {
        await this.syncQueue.pause();
        this.logger.log('Queue paused');
    }

    /**
     * Resume queue
     */
    async resumeQueue() {
        await this.syncQueue.resume();
        this.logger.log('Queue resumed');
    }

    /**
     * Get priority value for Bull
     */
    private getPriorityValue(priority?: string): number {
        switch (priority) {
            case 'critical':
                return 1;
            case 'high':
                return 3;
            case 'normal':
                return 5;
            case 'low':
                return 7;
            default:
                return 5;
        }
    }
}
