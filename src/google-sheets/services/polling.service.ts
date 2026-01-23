import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleSheetConfig } from '../entities/google-sheet-config.entity';
import { GoogleSheetsService } from '../google-sheets.service';

@Injectable()
export class PollingService {
    private readonly logger = new Logger(PollingService.name);
    private isPollingEnabled: boolean;

    constructor(
        @InjectRepository(GoogleSheetConfig)
        private configRepository: Repository<GoogleSheetConfig>,
        private googleSheetsService: GoogleSheetsService,
    ) { }

    // Initialize polling enabled flag based on environment variable.
    // Default: disabled for now. Set GOOGLE_SHEETS_SCHEDULE_ENABLED=true to enable.
    onModuleInit() {
        const flag = process.env.GOOGLE_SHEETS_SCHEDULE_ENABLED;
        if (flag !== undefined) {
            this.isPollingEnabled = String(flag).toLowerCase() === 'true';
            this.logger.log(`Polling ${this.isPollingEnabled ? 'enabled' : 'disabled'} via GOOGLE_SHEETS_SCHEDULE_ENABLED=${flag}`);
        } else {
            this.isPollingEnabled = false;
            this.logger.log('Polling disabled by default; set GOOGLE_SHEETS_SCHEDULE_ENABLED=true to enable');
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async checkForUpdates() {
        if (!this.isPollingEnabled) {
            return;
        }

        this.logger.log('Starting scheduled polling check...');

        try {
            const activeConfigs = await this.configRepository.find({
                where: {
                    is_active: true,
                    use_polling: true
                },
            });

            this.logger.log(`Found ${activeConfigs.length} active configs with polling enabled`);

            for (const config of activeConfigs) {
                try {
                    await this.checkConfigForUpdates(config);
                } catch (error) {
                    this.logger.error(
                        `Error checking config ${config.id}: ${error.message}`,
                        error.stack,
                    );
                }
            }

            this.logger.log('Polling check completed');
        } catch (error) {
            this.logger.error('Error in polling service:', error);
        }
    }

    private async checkConfigForUpdates(config: GoogleSheetConfig) {
        this.logger.log(`Checking for updates: ${config.name}`);

        const lastSync = config.last_sync_at;
        const now = new Date();

        if (lastSync) {
            const minutesSinceLastSync = (now.getTime() - lastSync.getTime()) / 1000 / 60;

            if (minutesSinceLastSync < 5) {
                this.logger.log(`Config ${config.id} synced recently, skipping`);
                return;
            }
        }

        try {
            // await this.googleSheetsService.syncSheetData(config.id);
            this.logger.log(`Sync triggered for config ${config.id}`);
        } catch (error) {
            this.logger.error(`Failed to sync config ${config.id}: ${error.message}`);
        }
    }

    enablePolling() {
        this.isPollingEnabled = true;
        this.logger.log('Polling enabled');
    }

    disablePolling() {
        this.isPollingEnabled = false;
        this.logger.log('Polling disabled');
    }

    isEnabled(): boolean {
        return this.isPollingEnabled;
    }
}
