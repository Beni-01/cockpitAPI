import { Injectable, Logger } from '@nestjs/common';
import { Activity } from '../../activity/entities/activity.entity';
import { BudgetData } from '../entities/budget-data.entity';

interface ValidationResult {
    valid: boolean;
    errors: string[];
}

interface ColumnMapping {
    [sheetColumn: string]: string; // sheetColumn -> entityField
}

@Injectable()
export class DataTransformerService {
    private readonly logger = new Logger(DataTransformerService.name);

    /**
     * Transform sheet row to Activity entity
     */
    transformToActivity(
        row: any,
        columnMapping: ColumnMapping,
    ): Partial<Activity> {
        const activity: Partial<Activity> = {};

        // Apply column mapping
        for (const [sheetColumn, entityField] of Object.entries(columnMapping)) {
            const value = row[sheetColumn];

            if (value !== undefined && value !== null && value !== '') {
                // Transform based on field type
                activity[entityField] = this.transformValue(entityField, value);
            }
        }

        // Set default values
        if (!activity.etat) {
            activity.etat = 'En attente';
        }

        if (!activity.createdAt) {
            activity.createdAt = new Date();
        }

        return activity;
    }

    /**
     * Transform sheet row to BudgetData entity
     */
    transformToBudgetData(
        row: any,
        columnMapping: ColumnMapping,
    ): Partial<BudgetData> {
        const budgetData: Partial<BudgetData> = {};

        // Log the raw row data for debugging
        // this.logger.debug(`Raw row data: ${JSON.stringify(row)}`);
        // this.logger.debug(`Column mapping: ${JSON.stringify(columnMapping)}`);

        // If no column mapping, use default field names
        if (!columnMapping || Object.keys(columnMapping).length === 0) {
            // Map common field names automatically
            budgetData.external_id = row['ID'] || row['External ID'] || row['Code'];
            budgetData.project_name = row['Project'] || row['Project Name'] || row['Projet'];
            budgetData.budget_category = row['Category'] || row['Budget Category'] || row['Catégorie'];
            budgetData.allocated_amount = this.parseNumber(row['Allocated'] || row['Budget Alloué'] || row['Budget']);
            budgetData.spent_amount = this.parseNumber(row['Spent'] || row['Dépensé'] || row['Consommé']) || 0;
            budgetData.budget_period = row['Period'] || row['Période'] || row['Year'];
            budgetData.start_date = this.parseDate(row['Start Date'] || row['Date Début']);
            budgetData.end_date = this.parseDate(row['End Date'] || row['Date Fin']);
            budgetData.status = this.mapBudgetStatus(row['Status'] || row['Statut']);
            budgetData.notes = row['Notes'] || row['Remarques'] || row['Comments'];
        } else {
            // Apply column mapping
            console.log('🔍 TRANSFORMER DEBUG:');
            console.log('Row keys:', Object.keys(row));
            console.log('Mapping keys:', Object.keys(columnMapping));
            console.log('First row value sample:', row[Object.keys(row)[0]]);

            for (const [sheetColumn, entityField] of Object.entries(columnMapping)) {
                const value = row[sheetColumn];

                console.log(`Checking: "${sheetColumn}" -> ${entityField}: value = ${value}`);

                if (value !== undefined && value !== null && value !== '') {
                    // Transform based on field type
                    budgetData[entityField] = this.transformBudgetValue(entityField, value);
                    console.log(`✅ Mapped: ${entityField} = ${budgetData[entityField]}`);
                }
            }
        }

        // Calculate remaining amount if not provided
        if (budgetData.allocated_amount && budgetData.spent_amount !== undefined) {
            budgetData.remaining_amount = budgetData.allocated_amount - budgetData.spent_amount;
        }

        // Set default status
        if (!budgetData.status) {
            budgetData.status = 'active';
        }

        // this.logger.debug(`Transformed budget data: ${JSON.stringify(budgetData)}`);

        return budgetData;
    }

    /**
     * Transform value for budget data fields
     */
    private transformBudgetValue(fieldName: string, value: any): any {
        // Date fields
        if (fieldName.includes('date') || fieldName.includes('Date')) {
            return this.parseDate(value);
        }

        // Numeric fields
        if (fieldName.includes('amount') || fieldName.includes('Amount')) {
            return this.parseNumber(value);
        }

        // Boolean fields
        if (fieldName === 'synced_from_sheet') {
            return this.parseBoolean(value);
        }

        // String fields - trim whitespace
        if (typeof value === 'string') {
            return value.trim();
        }

        return value;
    }

    /**
     * Map budget status from various formats
     */
    private mapBudgetStatus(value: any): string {
        if (!value) return 'active';

        const str = String(value).toLowerCase().trim();

        if (str.includes('actif') || str.includes('active') || str.includes('en cours')) {
            return 'active';
        }
        if (str.includes('terminé') || str.includes('completed') || str.includes('fini')) {
            return 'completed';
        }
        if (str.includes('annulé') || str.includes('cancelled') || str.includes('canceled')) {
            return 'cancelled';
        }

        return 'active';
    }

    /**
     * Validate budget data
     */
    validateBudgetData(budgetData: Partial<BudgetData>): ValidationResult {
        const errors: string[] = [];

        // Project name is recommended but not required
        if (!budgetData.project_name || budgetData.project_name.trim() === '') {
            // Just a warning, not an error
            this.logger.warn('Project name is empty');
        }

        // Amount validation
        if (budgetData.allocated_amount !== undefined && budgetData.allocated_amount !== null) {
            if (budgetData.allocated_amount < 0) {
                errors.push('Allocated amount cannot be negative');
            }
        }

        if (budgetData.spent_amount !== undefined && budgetData.spent_amount !== null) {
            if (budgetData.spent_amount < 0) {
                errors.push('Spent amount cannot be negative');
            }
        }

        // Date validation
        if (budgetData.start_date && budgetData.end_date) {
            if (budgetData.start_date > budgetData.end_date) {
                errors.push('Start date must be before end date');
            }
        }

        // Status validation
        const validStatuses = ['active', 'completed', 'cancelled'];
        if (budgetData.status && !validStatuses.includes(budgetData.status)) {
            errors.push(`Invalid status: ${budgetData.status}`);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Transform value based on field type
     */
    private transformValue(fieldName: string, value: any): any {
        // Date fields
        if (
            fieldName.includes('date') ||
            fieldName.includes('Date') ||
            ['dateDebut', 'dateFin', 'deadline'].includes(fieldName)
        ) {
            return this.parseDate(value);
        }

        // Numeric fields
        if (
            ['budget', 'budgetConsomme', 'budgetRestant'].includes(fieldName)
        ) {
            return this.parseNumber(value);
        }

        // Boolean fields
        if (fieldName.startsWith('is') || fieldName.startsWith('has')) {
            return this.parseBoolean(value);
        }

        // String fields - trim whitespace
        if (typeof value === 'string') {
            return value.trim();
        }

        return value;
    }

    /**
     * Parse date from various formats
     */
    private parseDate(value: any): Date | null {
        if (!value) return null;

        // If already a Date
        if (value instanceof Date) {
            return value;
        }

        // Try parsing string
        if (typeof value === 'string') {
            // Handle common formats
            // DD/MM/YYYY
            const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            if (ddmmyyyy.test(value)) {
                const [, day, month, year] = value.match(ddmmyyyy);
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }

            // YYYY-MM-DD
            const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
            if (yyyymmdd.test(value)) {
                return new Date(value);
            }

            // Try standard Date parse
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        // Handle Excel serial date number
        if (typeof value === 'number') {
            // Excel dates are days since 1900-01-01
            const excelEpoch = new Date(1900, 0, 1);
            const days = value - 2; // Excel bug: treats 1900 as leap year
            return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
        }

        this.logger.warn(`Could not parse date: ${value}`);
        return null;
    }

    /**
     * Parse number from string or number
     */
    private parseNumber(value: any): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            // Remove currency symbols, spaces, commas
            const cleaned = value.replace(/[^\d.-]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? null : parsed;
        }

        return null;
    }

    /**
     * Parse boolean from various formats
     */
    private parseBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            return ['true', 'yes', 'oui', '1', 'x'].includes(lower);
        }

        if (typeof value === 'number') {
            return value !== 0;
        }

        return false;
    }

    /**
     * Validate activity data
     */
    validateActivityData(activity: Partial<Activity>): ValidationResult {
        const errors: string[] = [];

        // Required fields
        if (!activity.titre || activity.titre.trim() === '') {
            errors.push('Title (titre) is required');
        }

        if (!activity.direction || activity.direction.trim() === '') {
            errors.push('Direction is required');
        }

        // Date validation
        if (activity.dateDebut && activity.dateFin) {
            if (activity.dateDebut > activity.dateFin) {
                errors.push('Start date must be before end date');
            }
        }

        // Budget validation
        if (activity.budget !== undefined && activity.budget !== null) {
            if (activity.budget < 0) {
                errors.push('Budget cannot be negative');
            }
        }

        // Status validation
        const validStatuses = [
            'En attente',
            'En cours',
            'Terminé',
            'Annulé',
            'Suspendu',
        ];
        if (activity.etat && !validStatuses.includes(activity.etat)) {
            errors.push(`Invalid status: ${activity.etat}`);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Transform activity to sheet row (for two-way sync)
     */
    transformToSheetRow(
        activity: Activity,
        columnMapping: ColumnMapping,
    ): any[] {
        const row: any[] = [];
        const reverseMapping = this.reverseColumnMapping(columnMapping);

        for (const [entityField, sheetColumn] of Object.entries(reverseMapping)) {
            const value = activity[entityField];
            row.push(this.formatValueForSheet(value));
        }

        return row;
    }

    /**
     * Reverse column mapping
     */
    private reverseColumnMapping(mapping: ColumnMapping): {
        [entityField: string]: string;
    } {
        const reversed: { [key: string]: string } = {};
        for (const [sheetCol, entityField] of Object.entries(mapping)) {
            reversed[entityField] = sheetCol;
        }
        return reversed;
    }

    /**
     * Format value for Google Sheets
     */
    private formatValueForSheet(value: any): any {
        if (value === null || value === undefined) {
            return '';
        }

        if (value instanceof Date) {
            // Format as DD/MM/YYYY
            const day = String(value.getDate()).padStart(2, '0');
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const year = value.getFullYear();
            return `${day}/${month}/${year}`;
        }

        if (typeof value === 'boolean') {
            return value ? 'Oui' : 'Non';
        }

        return String(value);
    }

    /**
     * Sanitize data to prevent injection
     */
    sanitizeData(data: any): any {
        if (typeof data === 'string') {
            // Remove potentially dangerous characters
            return data
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .trim();
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.sanitizeData(item));
        }

        if (typeof data === 'object' && data !== null) {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeData(value);
            }
            return sanitized;
        }

        return data;
    }
}
