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
            // console.log("sheets",sheets)
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
        options?: { startCol?: string; endCol?: string; headerRow?: number },
    ): Promise<any[]> {
        // Build effective range. Use defaults (B-K, header row 2) when:
        //  - `options` is provided (explicit request), or
        //  - the provided `range` does not include any row numbers (e.g. just a sheet name).
        let effectiveRange = range;

        const defaults = { startCol: 'B', endCol: 'K', headerRow: 2 };
        const opts = { ...defaults, ...(options || {}) };

        // If the original range does not contain any digit (no row specified),
        // or the caller provided explicit options, build a column-limited range.
        const rangeHasRowNumber = /\d/.test(range);
        if (!rangeHasRowNumber || options) {
            // Determine sheet prefix. Support:
            //  - 'Sheet1!A1:Z'  -> 'Sheet1!'
            //  - 'Sheet1!'      -> 'Sheet1!'
            //  - 'Sheet1'       -> 'Sheet1!'  (bare sheet name)
            const sheetNameMatch = range.match(/^([^!]+)!/);
            const sheetPrefix = sheetNameMatch
                ? `${sheetNameMatch[1]}!`
                : !range.includes('!') && !range.includes(':')
                    ? `${range}!`
                    : '';

            effectiveRange = `${sheetPrefix}${opts.startCol}${opts.headerRow}:${opts.endCol}`;
        }

        const data = await this.readSheet(spreadsheetId, effectiveRange);

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

    private cleanCode(value: any): string | null {
        if (value === undefined || value === null) return null;
        const s = String(value).trim();
        return s === '' ? null : s;
    }

    private deriveCostCode(row: any): string | null {
        const dept = this.cleanCode(row?.['CODE DEPARTEMENT']);
        const tache = this.cleanCode(row?.['CODE TACHE']);

        // If activity/sous activity are missing, treat them as '0'
        const activity = this.cleanCode(row?.['CODE ACTIVITE']) ?? '0';
        const sous = this.cleanCode(row?.['CODE SOUS ACTIVITE']) ?? '0';

        if (!dept || !tache) return null;
        return `${dept}.${activity}.${sous}.${tache}`;
    }

    private applyBudgetRowLogic(rows: any[]): any[] {
        return (rows || []).map((row) => {
            if (!row || typeof row !== 'object') return row;

            // Fill COST CODE if missing
            const existingCostCode = this.cleanCode(row['COST CODE']);
            if (!existingCostCode) {
                const derived = this.deriveCostCode(row);
                if (derived) row['COST CODE'] = derived;
            }

            // Optional convenience: if TACHES is empty, copy from SOUS ACTVITES
            const taches = this.cleanCode(row['TACHES']);
            const sousAct = this.cleanCode(row['SOUS ACTVITES']);
            if (!taches && sousAct) {
                row['TACHES'] = sousAct;
            }

            return row;
        });
    }

    /**
     * Read columns B-K with row 2 as header and log the results to console.
     * Call with the sheet name (e.g. 'Sheet1') or any range that includes the sheet name.
     */
    async readAndGetHeaderCostCenter(spreadsheetId: string, rangeOrSheetName: string): Promise<any[]> {
        const sheetName = String(rangeOrSheetName || '').split('!')[0];
        const range = `${sheetName}!B2:K`;
        try {
            const rows = await this.readSheetWithHeaders(spreadsheetId, range, {
                startCol: 'B',
                endCol: 'K',
                headerRow: 2,
            });

            const normalizedRows = this.applyBudgetRowLogic(rows);
            console.log(`Read ${normalizedRows.length} rows from ${range}:`, JSON.stringify(normalizedRows[0], null, 2));
            return normalizedRows;
        } catch (err) {
            console.error(`Failed to read and log ${range}:`, err);
            return [];
        }
    }

    /**
 * Read columns B-K with row 2 as header and log the results to console.
 * Call with the sheet name (e.g. 'Sheet1') or any range that includes the sheet name.
 */
    async readAndGetHeaderBudgetSummary(spreadsheetId: string, rangeOrSheetName: string): Promise<any[]> {
        const sheetName = String(rangeOrSheetName || '').split('!')[0];
        const range = `${sheetName}!A12:AD`;
        try {
            const rows = await this.readSheetWithHeaders(spreadsheetId, range, {
                startCol: 'A',
                endCol: 'AD',
                headerRow: 12,
            });

            // const normalizedRows = this.applyBudgetRowLogic(rows);
            console.log(`Read ${rows.length} rows from ${range}:`, JSON.stringify(rows[0], null, 2));
            return rows;
        } catch (err) {
            console.error(`Failed to read and log ${range}:`, err);
            return [];
        }
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
