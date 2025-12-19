import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { GoogleSheetsController } from './google-sheets.controller';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetConfig } from './entities/google-sheet-config.entity';
import { ColumnMapping } from './entities/column-mapping.entity';
import { SyncSchedule } from './entities/sync-schedule.entity';
import { WebhookConfig } from './entities/webhook-config.entity';
import { SyncLog } from './entities/sync-log.entity';
import { BudgetData } from './entities/budget-data.entity';
import { Activity } from '../activity/entities/activity.entity';
import { GoogleSheetsGateway } from './google-sheets.gateway';
import { RealtimeNotifierService } from './services/realtime-notifier.service';
import { PollingService } from './services/polling.service';
import { DataTransformerService } from './services/data-transformer.service';
import { SyncService } from './services/sync.service';
import { SheetReaderService } from './services/sheet-reader.service';
import { GoogleAuthService } from './services/google-auth.service';
import { WebhookService } from './services/webhook.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            GoogleSheetConfig,
            ColumnMapping,
            SyncSchedule,
            WebhookConfig,
            SyncLog,
            BudgetData,
            Activity,
        ]),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
    ],
    controllers: [GoogleSheetsController],
    providers: [
        GoogleSheetsService,
        // GoogleSheetsGateway, // Temporarily disabled - WebSocket error
        RealtimeNotifierService,
        PollingService,
        DataTransformerService,
        SyncService,
        SheetReaderService,
        GoogleAuthService,
        WebhookService,
    ],
    exports: [GoogleSheetsService, RealtimeNotifierService],
})
export class GoogleSheetsModule { }
