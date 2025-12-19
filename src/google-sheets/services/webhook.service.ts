import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleSheetConfig } from '../entities/google-sheet-config.entity';
import { SyncService } from './sync.service';
import * as crypto from 'crypto';

interface WebhookPayload {
    spreadsheetId: string;
    sheetName?: string;
    range?: string;
    editedCell?: {
        row: number;
        column: number;
        oldValue: any;
        newValue: any;
    };
    timestamp: string;
    signature?: string;
}

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);
    private readonly webhookSecret = process.env.WEBHOOK_SECRET || 'fonarev360-webhook-secret';

    // Rate limiting: max 10 webhooks per minute per sheet
    private webhookCounts = new Map<string, { count: number; resetTime: number }>();

    constructor(
        @InjectRepository(GoogleSheetConfig)
        private sheetConfigRepository: Repository<GoogleSheetConfig>,
        private syncService: SyncService,
    ) { }

    /**
     * Handle incoming webhook from Google Apps Script
     */
    async handleWebhook(payload: WebhookPayload): Promise<{
        success: boolean;
        message: string;
        syncTriggered: boolean;
    }> {
        try {
            this.logger.log(`Received webhook for spreadsheet: ${payload.spreadsheetId}`);

            // Validate payload
            this.validatePayload(payload);

            // Verify signature if provided
            if (payload.signature) {
                this.verifySignature(payload);
            }

            // Check rate limiting
            if (!this.checkRateLimit(payload.spreadsheetId)) {
                throw new BadRequestException('Rate limit exceeded');
            }

            // Find configuration for this spreadsheet
            const config = await this.sheetConfigRepository.findOne({
                where: {
                    sheet_id: payload.spreadsheetId,
                    is_active: true
                },
            });

            if (!config) {
                this.logger.warn(`No active configuration found for spreadsheet: ${payload.spreadsheetId}`);
                return {
                    success: false,
                    message: 'No active configuration found',
                    syncTriggered: false,
                };
            }

            // Check if polling is disabled (webhook-based sync is active)
            if (config.use_polling) {
                this.logger.log(`Webhook sync not enabled for config ${config.id} (using polling mode)`);
                return {
                    success: true,
                    message: 'Webhook sync not enabled, using polling mode',
                    syncTriggered: false,
                };
            }

            // Trigger sync asynchronously
            this.triggerAsyncSync(config.id, payload);

            return {
                success: true,
                message: 'Webhook received, sync triggered',
                syncTriggered: true,
            };
        } catch (error) {
            this.logger.error('Webhook handling failed', error);
            throw error;
        }
    }

    /**
     * Validate webhook payload
     */
    private validatePayload(payload: WebhookPayload): void {
        if (!payload.spreadsheetId) {
            throw new BadRequestException('spreadsheetId is required');
        }

        if (!payload.timestamp) {
            throw new BadRequestException('timestamp is required');
        }

        // Check timestamp is recent (within last 5 minutes)
        const payloadTime = new Date(payload.timestamp).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - payloadTime > fiveMinutes) {
            throw new BadRequestException('Webhook timestamp too old');
        }
    }

    /**
     * Verify webhook signature
     */
    private verifySignature(payload: WebhookPayload): void {
        const { signature, ...data } = payload;

        // Create signature from payload
        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(JSON.stringify(data))
            .digest('hex');

        if (signature !== expectedSignature) {
            throw new BadRequestException('Invalid webhook signature');
        }
    }

    /**
     * Check rate limiting
     */
    private checkRateLimit(spreadsheetId: string): boolean {
        const now = Date.now();
        const limit = this.webhookCounts.get(spreadsheetId);

        if (!limit || now > limit.resetTime) {
            // Reset counter
            this.webhookCounts.set(spreadsheetId, {
                count: 1,
                resetTime: now + 60000, // 1 minute
            });
            return true;
        }

        if (limit.count >= 10) {
            this.logger.warn(`Rate limit exceeded for spreadsheet: ${spreadsheetId}`);
            return false;
        }

        limit.count++;
        return true;
    }

    /**
     * Trigger sync asynchronously (don't wait for completion)
     */
    private async triggerAsyncSync(
        configId: number,
        payload: WebhookPayload,
    ): Promise<void> {
        try {
            // Don't await - let it run in background
            this.syncService.triggerManualSync(configId).catch((error) => {
                this.logger.error(
                    `Async sync failed for config ${configId}`,
                    error,
                );
            });

            this.logger.log(`Async sync triggered for config ${configId}`);
        } catch (error) {
            this.logger.error('Failed to trigger async sync', error);
        }
    }

    /**
     * Generate webhook signature for testing
     */
    generateSignature(payload: any): string {
        return crypto
            .createHmac('sha256', this.webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
    }

    /**
     * Get webhook URL for a configuration
     */
    getWebhookUrl(configId: number): string {
        const baseUrl = process.env.API_BASE_URL || 'http://10.140.0.106:8005';
        return `${baseUrl}/google-sheets/webhook/${configId}`;
    }

    /**
     * Generate Google Apps Script code for a configuration
     */
    generateAppsScriptCode(config: GoogleSheetConfig): string {
        const webhookUrl = this.getWebhookUrl(config.id);

        return `
// Google Apps Script - Auto-generated for ${config.name}
// Add this to your Google Sheet: Tools > Script editor

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  
  // Only trigger for the configured sheet
  if (sheet.getName() !== "${config.worksheet_name || 'Sheet1'}") {
    return;
  }
  
  // Prepare webhook payload
  var payload = {
    spreadsheetId: e.source.getId(),
    sheetName: sheet.getName(),
    range: range.getA1Notation(),
    editedCell: {
      row: range.getRow(),
      column: range.getColumn(),
      oldValue: e.oldValue,
      newValue: e.value
    },
    timestamp: new Date().toISOString()
  };
  
  // Send webhook
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch('${webhookUrl}', options);
    Logger.log('Webhook sent: ' + response.getContentText());
  } catch (error) {
    Logger.log('Webhook error: ' + error.toString());
  }
}

// Optional: Manual sync trigger
function triggerManualSync() {
  var payload = {
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    sheetName: SpreadsheetApp.getActiveSheet().getName(),
    timestamp: new Date().toISOString()
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  var response = UrlFetchApp.fetch('${webhookUrl}', options);
  SpreadsheetApp.getUi().alert('Sync triggered: ' + response.getContentText());
}
`;
    }
}
