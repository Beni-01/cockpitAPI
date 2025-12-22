import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class AutoDetectionService {
    private readonly logger = new Logger(AutoDetectionService.name);

    /**
     * Automatically detect sheet structure and create intelligent mapping
     */
    async autoDetectSheetStructure(
        spreadsheetId: string,
        worksheetName: string,
        auth: any,
    ): Promise<{
        headers: string[];
        sampleData: any[];
        suggestedMapping: Record<string, string>;
        dataStartRow: number;
    }> {
        const sheets = google.sheets({ version: 'v4', auth });

        // Read first 20 rows to analyze structure (some sheets have headers at row 13)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${worksheetName}!A1:Z20`,
        });

        const rows = response.data.values || [];

        // Find header row (first row with text in multiple columns)
        let headerRow = 0;
        for (let i = 0; i < Math.min(20, rows.length); i++) {
            const nonEmptyCount = rows[i]?.filter(cell => cell && String(cell).trim()).length || 0;
            if (nonEmptyCount >= 3) {
                headerRow = i;
                break;
            }
        }

        const headers = rows[headerRow] || [];
        const dataStartRow = headerRow + 2; // Next row after headers (1-indexed)
        const sampleData = rows.slice(headerRow + 1, headerRow + 4);

        // Intelligent mapping based on column names and data
        const suggestedMapping = this.createIntelligentMapping(headers, sampleData);

        return {
            headers,
            sampleData,
            suggestedMapping,
            dataStartRow,
        };
    }

    /**
     * Create intelligent mapping based on column names and data patterns
     */
    private createIntelligentMapping(
        headers: string[],
        sampleData: any[][],
    ): Record<string, string> {
        const mapping: Record<string, string> = {};

        headers.forEach((header, index) => {
            if (!header) return;

            // Trim and normalize header
            const cleanHeader = String(header).trim();
            const headerLower = cleanHeader.toLowerCase();
            const sampleValues = sampleData.map(row => row[index]).filter(v => v);

            // Detect Department explicitly
            if (headerLower.includes('department') || headerLower.includes('département')) {
                mapping[cleanHeader] = 'department_name';
            }

            // Detect project/name/activity
            else if (
                headerLower.includes('project') ||
                headerLower.includes('name') ||
                headerLower.includes('description') ||
                headerLower.includes('activit') ||
                headerLower.includes('libelle') ||
                headerLower.includes('description cc')
            ) {
                if (!mapping[cleanHeader]) {
                    mapping[cleanHeader] = 'project_name';
                }
            }

            // Detect ID/Cost Center columns
            else if (
                headerLower.includes('id') ||
                headerLower.includes('code') ||
                headerLower.includes('center') ||
                headerLower.includes('centre') ||
                headerLower.includes('cc')
            ) {
                if (headerLower.includes('cost') || headerLower.includes('cout')) {
                    mapping[cleanHeader] = 'cost_center';
                } else if (!Object.values(mapping).includes('external_id')) {
                    mapping[cleanHeader] = 'external_id';
                }
            }

            // Detect category columns
            else if (
                headerLower.includes('category') ||
                headerLower.includes('catégorie') ||
                headerLower.includes('type') ||
                headerLower.includes('libelle')
            ) {
                mapping[cleanHeader] = 'budget_category';
            }

            // Detect amount/budget columns (check if values are numbers)
            else if (
                headerLower.includes('amount') ||
                headerLower.includes('budget') ||
                headerLower.includes('total') ||
                headerLower.includes('montant') ||
                this.isNumericColumn(sampleValues)
            ) {
                if (!Object.values(mapping).includes('allocated_amount')) {
                    mapping[cleanHeader] = 'allocated_amount';
                } else if (!Object.values(mapping).includes('spent_amount')) {
                    mapping[cleanHeader] = 'spent_amount';
                }
            }

            // Detect date columns
            else if (
                headerLower.includes('date') ||
                headerLower.includes('period') ||
                headerLower.includes('période')
            ) {
                mapping[cleanHeader] = 'budget_period';
            }

            // Detect notes/description columns
            else if (
                headerLower.includes('note') ||
                headerLower.includes('comment') ||
                headerLower.includes('remark') ||
                headerLower.includes('cash flow')
            ) {
                mapping[cleanHeader] = 'notes';
            }
        });

        return mapping;
    }

    /**
     * Check if column contains mostly numeric values
     */
    private isNumericColumn(values: any[]): boolean {
        if (values.length === 0) return false;

        const numericCount = values.filter(v => {
            if (!v) return false;
            const cleaned = String(v).replace(/[,\s]/g, '');
            return !isNaN(parseFloat(cleaned));
        }).length;

        return numericCount / values.length > 0.7; // 70% numeric
    }

    /**
     * Sync any sheet with auto-detection
     */
    async syncWithAutoDetection(
        spreadsheetId: string,
        worksheetName: string,
        auth: any,
    ): Promise<any[]> {
        // Auto-detect structure
        const structure = await this.autoDetectSheetStructure(
            spreadsheetId,
            worksheetName,
            auth,
        );

        this.logger.log(`Auto-detected structure for ${worksheetName}:`);
        this.logger.log(`  Headers: ${structure.headers.join(', ')}`);
        this.logger.log(`  Mapping: ${JSON.stringify(structure.suggestedMapping, null, 2)}`);
        this.logger.log(`  Data starts at row: ${structure.dataStartRow}`);

        // Read all data
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${worksheetName}!A${structure.dataStartRow}:Z`,
        });

        const rows = response.data.values || [];

        // Transform data using detected mapping
        const transformedData = rows.map(row => {
            const record: any = {};

            structure.headers.forEach((header, index) => {
                const targetField = structure.suggestedMapping[header];
                if (targetField && row[index]) {
                    record[targetField] = row[index];
                }
            });

            return record;
        });

        return transformedData;
    }
}
