import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleSheetConfig } from '../entities/google-sheet-config.entity';
import { GoogleAuthService } from './google-auth.service';
import { sheets_v4 } from 'googleapis';

interface SheetData {
    values: any[][];
    range: string;
}

interface SyncResult {
    success: boolean;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    errors: string[];
}

@Injectable()
export class SheetReaderService {
    private readonly logger = new Logger(SheetReaderService.name);

    constructor(
        @InjectRepository(GoogleSheetConfig)
        private sheetConfigRepository: Repository<GoogleSheetConfig>,
        private googleAuthService: GoogleAuthService,
    ) { }

    /**
     * Read data from a Google Sheet
     */
    async readSheet(
        spreadsheetId: string,
        range: string,
    ): Promise<SheetData | null> {
        try {
            const sheets = await this.googleAuthService.getSheetsAPI();

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });

            return {
                values: response.data.values || [],
                range: response.data.range || range,
            };
        } catch (error) {
            this.logger.error(
                `Failed to read sheet ${spreadsheetId}, range ${range}`,
                error,
            );
            return null;
        }
    }

    /**
     * Read data with headers
     */
    async readSheetWithHeaders(
        spreadsheetId: string,
        range: string,
    ): Promise<any[]> {
        const data = await this.readSheet(spreadsheetId, range);

        if (!data || !data.values || data.values.length === 0) {
            return [];
        }

        const [headers, ...rows] = data.values;

        // Convert rows to objects using headers (trim to match auto-detection)
        return rows.map((row) => {
            const obj: any = {};
            headers.forEach((header, index) => {
                const cleanHeader = header ? String(header).trim() : '';
                if (cleanHeader) {
                    obj[cleanHeader] = row[index] || null;
                }
            });
            return obj;
        });
    }

    /**
     * Get sheet metadata
     */
    async getSheetMetadata(spreadsheetId: string): Promise<any> {
        try {
            const sheets = await this.googleAuthService.getSheetsAPI();

            const response = await sheets.spreadsheets.get({
                spreadsheetId,
            });

            return {
                title: response.data.properties?.title,
                sheets: response.data.sheets?.map((sheet) => ({
                    title: sheet.properties?.title,
                    sheetId: sheet.properties?.sheetId,
                    index: sheet.properties?.index,
                    rowCount: sheet.properties?.gridProperties?.rowCount,
                    columnCount: sheet.properties?.gridProperties?.columnCount,
                })),
            };
        } catch (error) {
            this.logger.error(
                `Failed to get metadata for sheet ${spreadsheetId}`,
                error,
            );
            return null;
        }
    }

    /**
     * Validate sheet structure
     */
    async validateSheetStructure(
        spreadsheetId: string,
        range: string,
        expectedHeaders: string[],
    ): Promise<{ valid: boolean; missingHeaders: string[] }> {
        const data = await this.readSheet(spreadsheetId, range);

        if (!data || !data.values || data.values.length === 0) {
            return {
                valid: false,
                missingHeaders: expectedHeaders,
            };
        }

        const headers = data.values[0];
        const missingHeaders = expectedHeaders.filter(
            (expected) => !headers.includes(expected),
        );

        return {
            valid: missingHeaders.length === 0,
            missingHeaders,
        };
    }

    /**
     * Get last modified time (using Drive API)
     */
    async getLastModifiedTime(spreadsheetId: string): Promise<Date | null> {
        try {
            const auth = await this.googleAuthService.getAuthClient();
            const { google } = require('googleapis');
            const drive = google.drive({ version: 'v3', auth });

            const response = await drive.files.get({
                fileId: spreadsheetId,
                fields: 'modifiedTime',
            });

            return response.data.modifiedTime
                ? new Date(response.data.modifiedTime)
                : null;
        } catch (error) {
            this.logger.error(
                `Failed to get last modified time for ${spreadsheetId}`,
                error,
            );
            return null;
        }
    }

    /**
     * Batch read multiple ranges
     */
    async batchReadRanges(
        spreadsheetId: string,
        ranges: string[],
    ): Promise<Map<string, any[][]>> {
        try {
            const sheets = await this.googleAuthService.getSheetsAPI();

            const response = await sheets.spreadsheets.values.batchGet({
                spreadsheetId,
                ranges,
            });

            const result = new Map<string, any[][]>();

            response.data.valueRanges?.forEach((valueRange, index) => {
                result.set(ranges[index], valueRange.values || []);
            });

            return result;
        } catch (error) {
            this.logger.error(
                `Failed to batch read ranges from ${spreadsheetId}`,
                error,
            );
            return new Map();
        }
    }
}
