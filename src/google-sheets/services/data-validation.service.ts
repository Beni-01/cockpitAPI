import { Injectable, Logger } from '@nestjs/common';
import {
    IsString, IsNumber, IsDate, IsEnum, IsOptional,
    validateSync, ValidationError
} from 'class-validator';
import { plainToClass } from 'class-transformer';

// Define validation schemas for different data types
export class BudgetDataSchema {
    @IsString()
    project_name: string;

    @IsString()
    @IsOptional()
    budget_category?: string;

    @IsNumber()
    @IsOptional()
    allocated_amount?: number;

    @IsNumber()
    @IsOptional()
    spent_amount?: number;

    @IsNumber()
    @IsOptional()
    remaining_amount?: number;

    @IsString()
    @IsOptional()
    department_name?: string;

    @IsString()
    @IsOptional()
    cost_center?: string;

    @IsString()
    @IsOptional()
    account_code?: string;

    @IsEnum(['OPEX', 'CAPEX', 'Mixed'])
    @IsOptional()
    budget_type?: string;

    @IsString()
    @IsOptional()
    status?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedData?: any;
}

@Injectable()
export class DataValidationService {
    private readonly logger = new Logger(DataValidationService.name);

    /**
     * Validate a single row of data against the schema
     */
    validateRow(row: any, schema: any = BudgetDataSchema): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Convert plain object to class instance
            const instance = plainToClass(schema, row);

            // Validate
            const validationErrors: ValidationError[] = validateSync(instance, {
                skipMissingProperties: true,
                whitelist: true,
                forbidNonWhitelisted: false,
            });

            // Collect errors
            validationErrors.forEach(error => {
                if (error.constraints) {
                    Object.values(error.constraints).forEach(message => {
                        errors.push(`${error.property}: ${message}`);
                    });
                }
            });

            // Sanitize data
            const sanitizedData = this.sanitizeData(row);

            // Check for warnings
            this.checkWarnings(sanitizedData, warnings);

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                sanitizedData: errors.length === 0 ? sanitizedData : undefined,
            };
        } catch (error) {
            this.logger.error(`Validation error: ${error.message}`, error.stack);
            return {
                isValid: false,
                errors: [`Validation failed: ${error.message}`],
                warnings: [],
            };
        }
    }

    /**
     * Validate multiple rows
     */
    validateBatch(rows: any[], schema: any = BudgetDataSchema): {
        validRows: any[];
        invalidRows: Array<{ row: any; errors: string[]; index: number }>;
        summary: {
            total: number;
            valid: number;
            invalid: number;
            warnings: number;
        };
    } {
        const validRows: any[] = [];
        const invalidRows: Array<{ row: any; errors: string[]; index: number }> = [];
        let warningCount = 0;

        rows.forEach((row, index) => {
            const result = this.validateRow(row, schema);

            if (result.isValid) {
                validRows.push(result.sanitizedData);
                if (result.warnings.length > 0) {
                    warningCount++;
                    this.logger.warn(`Row ${index + 1} has warnings:`, result.warnings);
                }
            } else {
                invalidRows.push({
                    row,
                    errors: result.errors,
                    index: index + 1,
                });
                this.logger.error(`Row ${index + 1} validation failed:`, result.errors);
            }
        });

        return {
            validRows,
            invalidRows,
            summary: {
                total: rows.length,
                valid: validRows.length,
                invalid: invalidRows.length,
                warnings: warningCount,
            },
        };
    }

    /**
     * Sanitize data - remove dangerous characters, trim strings, etc.
     */
    private sanitizeData(data: any): any {
        const sanitized = { ...data };

        Object.keys(sanitized).forEach(key => {
            const value = sanitized[key];

            if (typeof value === 'string') {
                // Trim whitespace
                sanitized[key] = value.trim();

                // Remove dangerous characters (basic XSS prevention)
                sanitized[key] = sanitized[key]
                    .replace(/<script[^>]*>.*?<\/script>/gi, '')
                    .replace(/<[^>]+>/g, '');

                // Convert empty strings to null
                if (sanitized[key] === '') {
                    sanitized[key] = null;
                }
            }

            // Convert string numbers to actual numbers
            if (this.isNumericField(key) && typeof value === 'string') {
                const num = parseFloat(value.replace(/,/g, ''));
                if (!isNaN(num)) {
                    sanitized[key] = num;
                }
            }

            // Convert string dates to Date objects
            if (this.isDateField(key) && typeof value === 'string') {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    sanitized[key] = date;
                }
            }
        });

        return sanitized;
    }

    /**
     * Check for warnings (non-critical issues)
     */
    private checkWarnings(data: any, warnings: string[]): void {
        // Check for missing optional but recommended fields
        const recommendedFields = ['budget_category', 'department_name', 'cost_center'];
        recommendedFields.forEach(field => {
            if (!data[field]) {
                warnings.push(`Recommended field '${field}' is missing`);
            }
        });

        // Check for unusual values
        if (data.allocated_amount && data.allocated_amount < 0) {
            warnings.push('Allocated amount is negative');
        }

        if (data.spent_amount && data.allocated_amount &&
            data.spent_amount > data.allocated_amount * 1.5) {
            warnings.push('Spent amount exceeds allocated amount by more than 50%');
        }

        // Check for potential duplicates (same project name)
        if (data.project_name && data.project_name.length < 3) {
            warnings.push('Project name is very short, might be incomplete');
        }
    }

    /**
     * Detect duplicates in a batch of data
     */
    detectDuplicates(rows: any[], uniqueFields: string[] = ['project_name']): {
        duplicates: Array<{ indices: number[]; data: any }>;
        hasDuplicates: boolean;
    } {
        const seen = new Map<string, number[]>();
        const duplicates: Array<{ indices: number[]; data: any }> = [];

        rows.forEach((row, index) => {
            // Create a key from unique fields
            const key = uniqueFields
                .map(field => String(row[field] || '').toLowerCase().trim())
                .join('|');

            if (seen.has(key)) {
                seen.get(key)!.push(index);
            } else {
                seen.set(key, [index]);
            }
        });

        // Find duplicates
        seen.forEach((indices, key) => {
            if (indices.length > 1) {
                duplicates.push({
                    indices: indices.map(i => i + 1), // 1-indexed for user display
                    data: rows[indices[0]],
                });
            }
        });

        return {
            duplicates,
            hasDuplicates: duplicates.length > 0,
        };
    }

    /**
     * Type conversion with safeguards
     */
    safeTypeConversion(value: any, targetType: 'string' | 'number' | 'boolean' | 'date'): any {
        try {
            switch (targetType) {
                case 'string':
                    return String(value);

                case 'number':
                    if (typeof value === 'string') {
                        value = value.replace(/,/g, '');
                    }
                    const num = Number(value);
                    return isNaN(num) ? null : num;

                case 'boolean':
                    if (typeof value === 'boolean') return value;
                    if (typeof value === 'string') {
                        const lower = value.toLowerCase();
                        if (['true', 'yes', '1', 'oui'].includes(lower)) return true;
                        if (['false', 'no', '0', 'non'].includes(lower)) return false;
                    }
                    return null;

                case 'date':
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? null : date;

                default:
                    return value;
            }
        } catch (error) {
            this.logger.error(`Type conversion failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Helper to check if field is numeric
     */
    private isNumericField(fieldName: string): boolean {
        const numericFields = [
            'allocated_amount', 'spent_amount', 'remaining_amount',
            'fiscal_year', 'quarter', 'month'
        ];
        return numericFields.includes(fieldName);
    }

    /**
     * Helper to check if field is a date
     */
    private isDateField(fieldName: string): boolean {
        const dateFields = ['created_at', 'updated_at', 'last_synced_at', 'changed_at'];
        return dateFields.includes(fieldName);
    }

    /**
     * Validate column mapping configuration
     */
    validateColumnMapping(mapping: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!mapping || typeof mapping !== 'object') {
            errors.push('Column mapping must be an object');
            return { isValid: false, errors, warnings };
        }

        // Check for required mappings
        const requiredMappings = ['project_name'];
        requiredMappings.forEach(field => {
            if (!mapping[field]) {
                errors.push(`Required mapping for '${field}' is missing`);
            }
        });

        // Check for recommended mappings
        const recommendedMappings = ['allocated_amount', 'spent_amount', 'budget_category'];
        recommendedMappings.forEach(field => {
            if (!mapping[field]) {
                warnings.push(`Recommended mapping for '${field}' is missing`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
}
