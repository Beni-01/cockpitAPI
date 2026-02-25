import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GoogleSheetConfig } from './entities/google-sheet-config.entity';
import { SyncLog } from './entities/sync-log.entity';
import { BudgetData } from './entities/budget-data.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { SyncService } from './services/sync.service';
import { AutoDetectionService } from './services/auto-detection.service';
import { GoogleAuthService } from './services/google-auth.service';
import { version } from 'os';

@Injectable()
export class GoogleSheetsService {
    constructor(
        @InjectRepository(GoogleSheetConfig)
        private configRepository: Repository<GoogleSheetConfig>,
        @InjectRepository(SyncLog)
        private syncLogRepository: Repository<SyncLog>,
        @InjectRepository(BudgetData)
        private budgetDataRepository: Repository<BudgetData>,
        private syncService: SyncService,
        private autoDetectionService: AutoDetectionService,
        private googleAuthService: GoogleAuthService,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async createConfig(createConfigDto: CreateConfigDto): Promise<GoogleSheetConfig> {
        const sheetId = this.extractSheetId(createConfigDto.sheet_url);

        const worksheet = createConfigDto.worksheet_name || 'Sheet1';
        const defaultRange = `${worksheet}!A2:K`;

        const config = this.configRepository.create({
            ...createConfigDto,
            sheet_id: sheetId,
            created_by: 1,
            range: (createConfigDto as any).range || defaultRange,
        });

        return this.configRepository.save(config);
    }

    async getAllConfigs(): Promise<GoogleSheetConfig[]> {
        return this.configRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    async getConfig(id: number): Promise<GoogleSheetConfig> {
        const config = await this.configRepository.findOne({ where: { id } });

        if (!config) {
            throw new NotFoundException('Configuration not found');
        }

        return config;
    }

    async updateConfig(id: number, updateConfigDto: UpdateConfigDto): Promise<GoogleSheetConfig> {
        const config = await this.getConfig(id);

        if (updateConfigDto.sheet_url) {
            const sheetId = this.extractSheetId(updateConfigDto.sheet_url);
            Object.assign(config, updateConfigDto, { sheet_id: sheetId });
        } else {
            Object.assign(config, updateConfigDto);
        }

        // Ensure range is set when worksheet_name changes or when empty
        if ((!config.range || config.range.trim() === '') && (config.worksheet_name || updateConfigDto.worksheet_name)) {
            const ws = updateConfigDto.worksheet_name || config.worksheet_name || 'Sheet1';
            config.range = `${ws}!A2:K`;
        }

        return this.configRepository.save(config);
    }

    async deleteConfig(id: number): Promise<void> {
        const result = await this.configRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException('Configuration not found');
        }
    }

    private extractSheetId(url: string): string {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : url;
    }

    async triggerSync(id: number): Promise<any> {
        try {
            const res = await this.syncService.syncSheet(id);
            return { message: 'Sync triggered successfully', res, configId: id ,version: "v1.0" };
        } catch (error) {
            return { message: 'Sync failed', error: error.message, configId: id,version: "v1.0" };
        }
    }
    async triggerSyncInput(id: number): Promise<any> {
        try {
            await this.syncService.syncSheet(id, "Depart_Budget_Opex Input");
            return { message: 'Sync triggered successfully', configId: id };
        } catch (error) {
            return { message: 'Sync failed', error: error.message, configId: id };
        }
    }

    async triggerSyncAllInput(): Promise<any> {
        try {
            const configs = await this.getAllConfigs();
            for (const cfg of configs) {
                await this.syncService.syncSheet(cfg.id, "Depart_Budget_Opex Input");
            }
            return { message: 'Sync triggered successfully for all configs' };
        } catch (error) {
            return { message: 'Sync failed', error: error.message };
        }
    }

    async syncAllConfigs(): Promise<any> {
        const configs = await this.getAllConfigs();
        const results: Array<any> = [];

        // Prefer running the Master Budget sheet first (if present), and
        // prefer running the HR budget sheet last (Fonarev_Budget_Ressources Humaines).
        let ordered = [...configs];

        // Move Master Budget to the front if found
        const firstIdx = ordered.findIndex(c => {
            const combined = ((c.name || '') + ' ' + (c.worksheet_name || '')).toLowerCase();
            return combined.includes('master budget') || combined.includes('master_budget') || combined.includes('master');
        });
        if (firstIdx > 0) {
            const [firstItem] = ordered.splice(firstIdx, 1);
            ordered.unshift(firstItem);
        }

        // Move HR budget to the end if found
        const lastIdx = ordered.findIndex(c => {
            const combined = ((c.name || '') + ' ' + (c.worksheet_name || '')).toLowerCase();
            return combined.includes('ressources humaines') || combined.includes('ressources_humaines') || combined.includes('ressources');
        });
        if (lastIdx !== -1 && lastIdx !== ordered.length - 1) {
            const [lastItem] = ordered.splice(lastIdx, 1);
            ordered.push(lastItem);
        }

        // Run sequentially to avoid exhausting API quotas; change to parallel with throttling if desired
        for (const cfg of ordered) {
            try {
                await this.syncService.syncSheet(cfg.id);
                results.push({ configId: cfg.id, status: 'success', triggeredBy: null });
            } catch (err) {
                results.push({ configId: cfg.id, status: 'error', error: err?.message || String(err), triggeredBy: null });
            }
        }

        return { message: 'Sync attempted for all configs', total: configs.length, results };
    }



    async getSyncLogs(): Promise<SyncLog[]> {
        return this.syncLogRepository.find({
            relations: ['config'],
            order: { started_at: 'DESC' },
            take: 50,
        });
    }

    async getAnalytics(since?: string): Promise<any> {
        // Optional since filter (ISO date)
        const params: any[] = [];
        let sinceClause = '';
        if (since) {
            sinceClause = 'AND l.started_at >= ?';
            params.push(since);
        }

        const perConfigSql = `
            SELECT
                c.id,
                c.name,
                c.worksheet_name,
                c.last_sync_at,
                c.last_sync_status,
                COUNT(l.id) AS total_syncs,
                COALESCE(SUM(l.records_fetched),0) AS records_fetched,
                COALESCE(SUM(l.records_inserted),0) AS records_inserted,
                COALESCE(SUM(l.records_updated),0) AS records_updated,
                COALESCE(SUM(l.records_skipped),0) AS records_skipped,
                COALESCE(SUM(CASE WHEN l.status = 'success' THEN 1 ELSE 0 END),0) AS success_count,
                COALESCE(SUM(CASE WHEN l.status = 'failed' THEN 1 ELSE 0 END),0) AS failed_count,
                MAX(CASE WHEN l.status = 'success' THEN l.completed_at ELSE NULL END) AS last_success_at,
                MAX(CASE WHEN l.status = 'failed' THEN l.completed_at ELSE NULL END) AS last_failed_at
            FROM google_sheet_config c
            LEFT JOIN google_sheet_sync_log l ON l.config_id = c.id ${since ? `AND l.started_at >= ?` : ''}
            GROUP BY c.id
            ORDER BY c.name ASC
        `;

        // execute per-config query
        const perConfigParams = since ? [since] : [];
        const perConfig = await this.dataSource.query(perConfigSql, perConfigParams);

        // overall totals
        const overallSql = `
            SELECT
                COUNT(l.id) AS total_syncs,
                COALESCE(SUM(l.records_fetched),0) AS records_fetched,
                COALESCE(SUM(l.records_inserted),0) AS records_inserted,
                COALESCE(SUM(l.records_updated),0) AS records_updated,
                COALESCE(SUM(l.records_skipped),0) AS records_skipped,
                COALESCE(SUM(CASE WHEN l.status = 'success' THEN 1 ELSE 0 END),0) AS success_count,
                COALESCE(SUM(CASE WHEN l.status = 'failed' THEN 1 ELSE 0 END),0) AS failed_count
            FROM google_sheet_sync_log l
            WHERE 1=1 ${sinceClause}
        `;

        const overall = await this.dataSource.query(overallSql, params);

        return {
            generated_at: new Date(),
            since: since || null,
            overall: overall[0] || {},
            perConfig,
        };
    }

    async getBudgetData(): Promise<BudgetData[]> {
        return this.budgetDataRepository.find({
            order: { last_synced_at: 'DESC' },
            take: 50,
        });
    }

    async autoDetectAndSync(id: number): Promise<any> {
        const config = await this.getConfig(id);

        // Get auth
        const auth = await this.googleAuthService.getAuthClient();

        // Auto-detect structure
        const structure = await this.autoDetectionService.autoDetectSheetStructure(
            config.sheet_id,
            config.worksheet_name,
            auth,
        );

        // Update config with detected mapping
        config.columnMapping = structure.suggestedMapping;
        config.range = `${config.worksheet_name}!A${structure.dataStartRow}:Z`;
        await this.configRepository.save(config);

        // Trigger sync
        await this.syncService.syncSheet(id);

        return {
            message: 'Auto-detection and sync completed',
            structure: {
                headers: structure.headers,
                mapping: structure.suggestedMapping,
                dataStartRow: structure.dataStartRow,
            },
        };
    }

    async getAuditLogs(): Promise<any[]> {
        return this.budgetDataRepository.manager.query(`
            SELECT 
                c.name AS sheet_name,
                c.worksheet_name AS tab_name,
                l.field_name AS column_changed,
                l.old_value,
                l.new_value,
                l.changed_at
            FROM budget_data_change_log l
            JOIN budget_data b ON l.budget_data_id = b.id
            JOIN google_sheet_config c ON b.config_id = c.id
            ORDER BY l.changed_at DESC
            LIMIT 100
        `);
    }

    async getDepartments(): Promise<string[]> {
        const result = await this.dataSource.query(
            'SELECT DISTINCT department FROM master_data_hierarchy ORDER BY department'
        );
        return result.map((row: any) => row.department);
    }

    async getActivities(department: string): Promise<string[]> {
        const result = await this.dataSource.query(
            'SELECT DISTINCT activity FROM master_data_hierarchy WHERE department = ? ORDER BY activity',
            [department]
        );
        return result.map((row: any) => row.activity);
    }

    async repiarTransactionCentre(): Promise<any> {
        const rows: any[] = await this.dataSource.query(
            'SELECT * FROM transactions_backup_with_cost_center',
            []
        );

        let updated = 0;
        for (const row of rows) {
            const contRaw = row.cont_center;
            const cont = contRaw ? String(contRaw).trim() : null;
            if (!cont) continue;
            console.log(`Processing transaction id=${row.id} cont_center="${cont}" currentCentre=${row.centreId}`);

            // Case-insensitive trimmed match against budget.cost_center
            const budget = await this.dataSource.query(
                'SELECT id FROM budget WHERE LOWER(TRIM(cost_center)) = LOWER(TRIM(?)) LIMIT 1',
                [cont]
            );

            if (budget && budget.length > 0) {
                const budgetId = budget[0].id;
                // If there are transactions that currently reference the old centreId, update them all
                if (row.centreId) {
                    const txs = await this.dataSource.query('SELECT id FROM transaction WHERE centreId = ?', [row.centreId]);
                    if (txs && txs.length > 0) {
                        const res: any = await this.dataSource.query('UPDATE transaction SET centreId = ? WHERE centreId = ?', [budgetId, row.centreId]);
                        const affected = res && (res.affectedRows ?? res.affected ?? res.changedRows ?? txs.length);
                        updated += Number(affected ?? txs.length);
                        console.log(`Updated ${affected ?? txs.length} transaction(s) with old centreId=${row.centreId} -> ${budgetId}`);
                    }
                    //  else {
                    //     // No transactions matching the old centreId — try updating this specific transaction id
                    //     const res: any = await this.dataSource.query('UPDATE transaction SET centreId = ? WHERE id = ?', [budgetId, row.id]);
                    //     const affected = res && (res.affectedRows ?? res.affected ?? res.changedRows ?? 0);
                    //     if (affected && affected > 0) {
                    //         updated += Number(affected);
                    //         console.log(`Updated transaction ${row.id} centreId ${row.centreId} -> ${budgetId}`);
                    //     } else {
                    //         console.log(`No transaction rows updated for id=${row.id} or centreId=${row.centreId}`);
                    //     }
                    // }
                }
                // else {
                //     // No existing centreId on backup row — update by id
                //     const res: any = await this.dataSource.query('UPDATE transaction SET centreId = ? WHERE id = ?', [budgetId, row.id]);
                //     const affected = res && (res.affectedRows ?? res.affected ?? res.changedRows ?? 0);
                //     if (affected && affected > 0) {
                //         updated += Number(affected);
                //         console.log(`Updated transaction ${row.id} centreId -> ${budgetId}`);
                //     } else {
                //         console.log(`No transaction updated for id=${row.id}`);
                //     }
                // }
            } else {
                console.log(`No budget found for cont_center="${cont}"`);
            }
        }

        return { totalRows: rows.length, updated };
    }
}
