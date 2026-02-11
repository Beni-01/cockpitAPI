// Category constants based on provided screenshot
const CATEGORY_LIST = [
    { id: 1, name: 'Operation', code: 'OP', description: null },
    { id: 2, name: 'COMMUNICATION', code: 'COMM', description: null },
    { id: 3, name: 'Fonctionnement', code: 'FONC', description: null },
    { id: 4, name: 'Capex', code: 'CAPEX', description: null },
];

// Map of explicit department name -> category name (lowercased keys)
const DEPARTMENT_TO_CATEGORY: Record<string, string> = {
    'etudes': 'Operation',
    'mediation': 'Operation',
    'acces a la justice': 'Operation',
    'acces à la justice': 'Operation',
    'reparation': 'Operation',
    'communication': 'COMMUNICATION',
    'direction générale': 'Fonctionnement',
    "conseil d'administration": 'Fonctionnement',
    'conseil d administration': 'Fonctionnement',
    'direction financière': 'Fonctionnement',
    'audit interne': 'Fonctionnement',
    'ressources humaines': 'Fonctionnement',
    'juridique': 'Fonctionnement',
    'services generaux & adm': 'Fonctionnement',
    'passation de marche': 'Fonctionnement',
    'securite': 'Operation',
    'genocost': 'Operation',
    'plaidoyer international': 'Operation',
    'capex': 'Capex',
};

/**
 * Infer category object from a department name using explicit map and simple patterns.
 */
function inferCategoryFromDepartment(deptName?: string | null) {
    if (!deptName) return null;
    const d = String(deptName).trim().toLowerCase();
    if (!d) return null;

    // Exact map
    if (DEPARTMENT_TO_CATEGORY[d.toLowerCase()]) {
        const catName = DEPARTMENT_TO_CATEGORY[d.toLowerCase()];
        return catName;
    }


    return null;
}
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleSheetConfig } from '../entities/google-sheet-config.entity';
import { BudgetData } from '../entities/budget-data.entity';
import { SyncLog } from '../entities/sync-log.entity';
import { BudgetDataChangeLog } from '../entities/budget-data-change-log.entity';
import { SheetReaderService } from './sheet-reader.service';
import { DataTransformerService } from './data-transformer.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Department } from '../../department/entities/department.entity';
import { BudgetActivity } from '../../budget/entities/budget-activity.entity';
import { BudgetSousActivity } from '../../budget/entities/budget-sous-activity.entity';
import { BudgetTache } from '../../budget/entities/budget-tache.entity';
import { Category } from '../../category/entities/category.entity';
import { Budget } from 'src/budget/entities/budget.entity';

interface SyncResult {
    configId: number;
    success: boolean;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsSkipped: number;
    errors: string[];
    startTime: Date;
    endTime: Date;
    duration: number;
}

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);
    private syncInProgress = new Map<number, boolean>();

    constructor(
        @InjectRepository(GoogleSheetConfig)
        private sheetConfigRepository: Repository<GoogleSheetConfig>,
        @InjectRepository(Budget)
        private budgetDataRepository: Repository<Budget>,
        @InjectRepository(SyncLog)
        private syncLogRepository: Repository<SyncLog>,
        @InjectRepository(BudgetDataChangeLog)
        private changeLogRepository: Repository<BudgetDataChangeLog>,
        @InjectRepository(Department)
        private departmentRepo: Repository<Department>,
        @InjectRepository(BudgetActivity)
        private activityRepo: Repository<BudgetActivity>,
        @InjectRepository(BudgetSousActivity)
        private sousActivityRepo: Repository<BudgetSousActivity>,
        @InjectRepository(BudgetTache)
        private tacheRepo: Repository<BudgetTache>,
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>,
        private sheetReaderService: SheetReaderService,
        private dataTransformerService: DataTransformerService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Scheduled sync - runs every 15 minutes
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async scheduledSync() {
        // Allow runtime disabling of scheduled syncs via environment variable.
        // Set GOOGLE_SHEETS_SCHEDULE_ENABLED=false to prevent scheduled runs.
        const flag = process.env.GOOGLE_SHEETS_SCHEDULE_ENABLED;
        if (flag && String(flag).toLowerCase() === 'false') {
            this.logger.log('Scheduled sync disabled via GOOGLE_SHEETS_SCHEDULE_ENABLED=false');
            return;
        }

        this.logger.log('Starting scheduled sync...');

        const activeConfigs = await this.sheetConfigRepository.find({
            where: { is_active: true },
        });
        for (const config of activeConfigs) {
            try {
                await this.syncSheet(config.id);
            } catch (error) {
                this.logger.error(
                    `Scheduled sync failed for config ${config.id}`,
                    error,
                );
            }
        }

        this.logger.log('Scheduled sync completed');
    }

    /**
     * Sync a specific sheet configuration
     */
    async syncSheet(configId: number): Promise<SyncResult> {
        const startTime = new Date();
        let syncLog: SyncLog | null = null;


        console.log("sync")

        const config = await this.sheetConfigRepository.findOne({
            where: { id: configId },
        });

        if (!config) {
            throw new Error(`Configuration ${configId} not found`);
        }

        this.syncInProgress.set(configId, true);

        try {
            // Get configuration
            const config = await this.sheetConfigRepository.findOne({
                where: { id: configId },
            });

            if (!config) {
                throw new Error(`Configuration ${configId} not found`);
            }

            if (!config.is_active) {
                throw new Error(`Configuration ${configId} is not active`);
            }

            this.logger.log(`Starting sync for: ${config.name}`);

            // Create sync log entry
            syncLog = this.syncLogRepository.create({
                config_id: configId,
                trigger_source: 'polling',
                status: 'in_progress',
                started_at: startTime,
            });
            await this.syncLogRepository.save(syncLog);

            // Emit sync started event
            this.eventEmitter.emit('sheet.sync.started', { configId, config });

            // Read data from sheet
            const range = config.range || config.worksheet_name;
            let sheetData: any = [];
            if (config.worksheet_name === "Cost Center") {
                sheetData = await this.sheetReaderService.readAndGetHeaderCostCenter(
                    config.spreadsheetId,
                    range,
                );
            }
            if (config.worksheet_name === "Summary") {
                sheetData = await this.sheetReaderService.readAndGetHeaderBudgetSummary(
                    config.spreadsheetId,
                    range,
                )
            }

            if (!sheetData || sheetData.length === 0) {
                this.logger.warn(`No data found in sheet for config ${configId}`);

                // Update sync log before returning
                if (syncLog) {
                    syncLog.status = 'success';
                    syncLog.records_fetched = 0;
                    syncLog.records_inserted = 0;
                    syncLog.records_updated = 0;
                    syncLog.records_skipped = 0;
                    syncLog.error_message = 'No data found in sheet';
                    syncLog.completed_at = new Date();
                    await this.syncLogRepository.save(syncLog);
                }

                // Update config
                config.lastSyncAt = new Date();
                config.lastSyncStatus = 'success';
                config.lastSyncMessage = 'No data found in sheet';
                await this.sheetConfigRepository.save(config);

                const endTime = new Date();
                const syncResult = this.createSyncResult(configId, startTime, {
                    success: true,
                    recordsProcessed: 0,
                    recordsCreated: 0,
                    recordsUpdated: 0,
                    recordsSkipped: 0,
                    errors: ['No data found in sheet'],
                    endTime,
                });

                // Emit sync completed event
                this.eventEmitter.emit('sheet.sync.completed', syncResult);

                return syncResult;
            }
            // Transform and sync data
            const result = await this.transformAndSyncData(config, sheetData, syncLog);

            // Update sync log with results
            if (syncLog) {
                syncLog.status = result.success ? 'success' : 'failed';
                syncLog.records_fetched = result.recordsProcessed;
                syncLog.records_inserted = result.recordsCreated;
                syncLog.records_updated = result.recordsUpdated;
                syncLog.records_skipped = result.recordsSkipped;
                syncLog.error_message = result.errors.join('; ') || null;
                syncLog.completed_at = new Date();
                await this.syncLogRepository.save(syncLog);
            }

            // Update last sync time
            config.lastSyncAt = new Date();
            config.lastSyncStatus = result.success ? 'success' : 'error';
            config.lastSyncMessage = result.errors.join('; ') || 'Sync completed successfully';
            await this.sheetConfigRepository.save(config);

            const endTime = new Date();
            const syncResult = this.createSyncResult(configId, startTime, {
                ...result,
                endTime,
            });

            // Emit sync completed event
            this.eventEmitter.emit('sheet.sync.completed', syncResult);

            this.logger.log(
                `Sync completed for config ${configId}: ${result.recordsCreated} created, ${result.recordsUpdated} updated`,
            );

            return syncResult;
        } catch (error) {
            this.logger.error(`Sync failed for config ${configId}`, error);

            // Update sync log with error
            if (syncLog) {
                syncLog.status = 'failed';
                syncLog.error_message = error.message;
                syncLog.completed_at = new Date();
                await this.syncLogRepository.save(syncLog);
            }

            const endTime = new Date();
            const syncResult = this.createSyncResult(configId, startTime, {
                success: false,
                recordsProcessed: 0,
                recordsCreated: 0,
                recordsUpdated: 0,
                recordsSkipped: 0,
                errors: [error.message],
                endTime,
            });

            // Emit sync failed event
            this.eventEmitter.emit('sheet.sync.failed', syncResult);

            throw error;
        } finally {
            this.syncInProgress.set(configId, false);
        }
    }

    private cleanCell(value: any): string | null {
        if (value === undefined || value === null) return null;
        const s = String(value).trim();
        return s === '' ? null : s;
    }

    // Retrieve a cell value by trying multiple possible header names.
    // Tries exact keys first, then case-insensitive matches against available row keys.
    private getCellValue(row: any, keys: string[]): string | null {
        if (!row) return null;

        // Try exact keys first (useful when headers are normalized exactly)
        for (const k of keys) {
            if (Object.prototype.hasOwnProperty.call(row, k)) {
                const v = this.cleanCell(row[k]);
                if (v) return v;
            }
        }

        // Fallback: case-insensitive lookup against the row's keys
        const lookup: Record<string, any> = {};
        for (const rk of Object.keys(row)) {
            lookup[rk.toLowerCase().trim()] = row[rk];
        }

        for (const k of keys) {
            const candidate = lookup[k.toLowerCase().trim()];
            if (candidate !== undefined) {
                const v = this.cleanCell(candidate);
                if (v) return v;
            }
        }

        return null;
    }

    private parseCostCode(costCode: string): { dept: string; act: string; sous: string; tache: string } | null {
        const raw = this.cleanCell(costCode);
        if (!raw) return null;

        const parts = raw.split('.').map((p) => p.trim());
        if (parts.length < 4) return null;

        const [dept, act, sous, tache] = parts;
        if (!dept || !act || !sous || !tache) return null;

        return { dept, act, sous, tache };
    }

    private async upsertDepartment(code: string, name: string): Promise<Department> {
        const cat = inferCategoryFromDepartment(name === "FINANCE" ? "CAPEX" : name || "");
        const catobj = cat ? await this.categoryRepo.findOne({ where: { name: cat } }) : null;
        const existing = await this.departmentRepo.findOne({ where: { code } });
        if (existing) {
            if (name) {
                existing.name = name === "FINANCE" ? "CAPEX" : name;
                existing.categoryId = catobj ? catobj.id : null;
                return this.departmentRepo.save(existing);
            }
            return existing;
        }

        const created: any = this.departmentRepo.create({ code, name: name === "FINANCE" ? "CAPEX" : name, categoryId: catobj ? catobj.id : null });
        return this.departmentRepo.save(created);
    }

    private async upsertActivity(department: Department, code: string, name?: string | null): Promise<BudgetActivity> {
        const existing = await this.activityRepo
            .createQueryBuilder('a')
            .where('a.code = :code', { code })
            .andWhere('a.department_id = :deptId', { deptId: department.id })
            .getOne();

        if (existing) {
            const nextName = name ?? existing.name;
            if (nextName !== existing.name || !existing.departmentId) {
                existing.name = nextName ?? null;
                existing.department = department;
                return this.activityRepo.save(existing);
            }
            return existing;
        }

        const created = this.activityRepo.create({
            code,
            name: name ?? null,
            department,
        });
        return this.activityRepo.save(created);
    }

    private async upsertSousActivity(
        department: Department,
        activity: BudgetActivity | null,
        code: string,
        name?: string | null,
    ): Promise<BudgetSousActivity> {
        const qb = this.sousActivityRepo
            .createQueryBuilder('s')
            .where('s.code = :code', { code })
            .andWhere('s.department_id = :deptId', { deptId: department.id });

        if (activity?.id) {
            qb.andWhere('s.activity_id = :actId', { actId: activity.id });
        } else {
            qb.andWhere('s.activity_id IS NULL');
        }

        const existing = await qb.getOne();
        if (existing) {
            const nextName = name ?? existing.name;
            let changed = false;
            if (nextName !== existing.name) {
                existing.name = nextName ?? null;
                changed = true;
            }
            if (!existing.departmentId) {
                existing.department = department;
                changed = true;
            }
            if (activity?.id && (!existing.activity || (existing.activity as any).id !== activity.id)) {
                existing.activity = activity;
                changed = true;
            }
            return changed ? this.sousActivityRepo.save(existing) : existing;
        }

        const created = this.sousActivityRepo.create({
            code,
            name: name ?? null,
            department,
            activity: activity ?? null,
        });
        return this.sousActivityRepo.save(created);
    }

    private async upsertTache(
        department: Department,
        activity: BudgetActivity | null,
        sousActivity: BudgetSousActivity | null,
        code: string,
        costCode: string,
        name?: string | null,
    ): Promise<BudgetTache> {
        const existing = await this.tacheRepo
            .createQueryBuilder('t')
            .where('t.costCode = :costCode', { costCode })
            .andWhere('t.department_id = :deptId', { deptId: department.id })
            .getOne();

        if (existing) {
            let changed = false;
            const nextName = name ?? existing.name;
            if (nextName !== existing.name) {
                existing.name = nextName ?? null;
                changed = true;
            }
            if (existing.code !== code) {
                existing.code = code;
                changed = true;
            }
            if (existing.costCode !== costCode) {
                existing.costCode = costCode;
                changed = true;
            }
            if (!existing.departmentId) {
                existing.department = department;
                changed = true;
            }
            if (activity?.id && existing.activityId !== activity.id) {
                existing.activity = activity;
                changed = true;
            }
            if (sousActivity?.id && (!existing.sousActivity || (existing.sousActivity as any).id !== sousActivity.id)) {
                existing.sousActivity = sousActivity;
                changed = true;
            }
            return changed ? this.tacheRepo.save(existing) : existing;
        }

        const created = this.tacheRepo.create({
            code,
            costCode,
            name: name ?? null,
            department,
            activity: activity ?? null,
            sousActivity: sousActivity ?? null,
        });
        return this.tacheRepo.save(created);
    }

    private async ensureHierarchyForRow(row: any): Promise<void> {
        // Only use these sheet headers:
        // DEPARTEMENT / DIRECTION, ACTIVITES, SOUS ACTVITES, TACHES, COST CODE, CODE DEPARTEMENT

        console.log("ensureHierarchyForRow", row)
        const costCode = this.getCellValue(row, ['COST CODE', 'COST_CODE', 'COSTCODE']);
        const parsed = costCode ? this.parseCostCode(costCode) : null;

        const departmentCode = this.getCellValue(row, ['CODE DEPARTEMENT', 'CODE_DEPARTEMENT', 'CODE DEPARTMENT', 'DEPARTMENT CODE']) || parsed?.dept || null;
        const departmentName = this.getCellValue(row, ['DEPARTEMENT / DIRECTION', 'DIRECTION', 'DEPARTEMENT', 'DEPARTMENT', 'DEPARTEMENT/DIRECTION']);

        const activityName = this.getCellValue(row, ['ACTIVITES', 'ACTIVITIES', 'ACTIVITÉS', 'ACTIVITE']);
        const sousName = this.getCellValue(row, ['SOUS ACTVITES', 'SOUS ACTIVITES', 'SOUS-ACTIVITES', 'SOUS ACTIVITY', 'SOUS_ACTVITES', 'SOUS_ACTIVITES']);
        const tacheName = this.getCellValue(row, ['TACHES', 'TÂCHES', 'TASKS', 'TACHE']);

        const activityCode = parsed?.act || null;
        const sousCode = parsed?.sous || null;
        const tacheCode = parsed?.tache || null;

        if (!departmentCode) return;
        if (!departmentName) {
            throw new Error(`Missing DEPARTEMENT / DIRECTION for CODE DEPARTEMENT=${departmentCode}`);
        }

        const department = await this.upsertDepartment(departmentCode, departmentName);



        // Create/update activity only if we have a code (from COST CODE) OR a name
        const activity = activityCode || activityName
            ? await this.upsertActivity(department, activityCode || '0', activityName)
            : null;

        // Create/update sous-activity only if we have a code (from COST CODE) OR a name
        const sousActivity = sousCode || sousName
            ? await this.upsertSousActivity(department, activity, sousCode || '0', sousName)
            : null;

        if (tacheCode && costCode) {
            await this.upsertTache(department, activity, sousActivity, tacheCode, costCode, tacheName);
        }
    }

    /**
     * Transform and sync data to database
     */
    private async transformAndSyncData(
        config: GoogleSheetConfig,
        sheetData: any[],
        syncLog?: SyncLog,
    ): Promise<{
        success: boolean;
        recordsProcessed: number;
        recordsCreated: number;
        recordsUpdated: number;
        recordsSkipped: number;
        errors: string[];
    }> {
        let recordsCreated = 0;
        let recordsUpdated = 0;
        let recordsSkipped = 0;
        const errors: string[] = [];
        console.log("transformAndSyncData", sheetData[10])
        const parseMoneyToString = (v: string | null) => {
            if (!v) return null;
            const num = String(v).replace(/[^0-9.-]+/g, '');
            if (num === '') return null;
            return num;
        };

        for (const row of sheetData) {
            try {
                if (config.worksheet_name === "Cost Center") {
                    await this.ensureHierarchyForRow(row);
                } else {
                    // Only process Cost Center rows into the `budget` table
                    const costCenter = this.getCellValue(row, ['Cost Center', 'Cost_Center', 'CostCenter', 'Cost center', 'Cost centre']);
                    if (!costCenter) {
                        this.logger.debug(`Skipping row without Cost Center for config ${config.id}`);
                        recordsSkipped++;
                        continue;
                    }



                    // ensure hierarchy for this row (creates department/activity/sous/tache if needed)

                    // find tache by cost center (costCode)
                    const tache = await this.tacheRepo.findOne({ where: { costCode: costCenter }, relations: ['activity', 'sousActivity', 'department'] });

                    // parse values
                    const description = this.getCellValue(row, ['Description CC', 'Description', 'Description CC']);
                    const totalUnits = parseMoneyToString(this.getCellValue(row, ['Total en Unite de Mesure des donnees mensuelles', 'Total en Unite de Mesure des donnees mensuelles']));
                    const totalBudget = parseMoneyToString(this.getCellValue(row, ['Total Budget en USD', 'Total Budget', 'Total Budget USD', 'Total Budget in USD', 'Total Budget en USD']));
                    const { departmentName } = this.parseDescriptionCC(description)
                    let assignedDepartmentId: number | null = null;
                    if (departmentName === "RESSOURCES HUMAINES") {
                        const trimmedDesc = description.replace("RESSOURCES HUMAINES", "").trim();
                        const departmentsList: Array<{ id: number; name: string }> = await this.departmentRepo.find();
                        const descUpper = trimmedDesc.toUpperCase();
                        console.log("departmentsList", descUpper, departmentsList?.length, departmentsList?.map(d => d.name))

                        departmentsList?.map((d) => {
                            if (descUpper?.includes(d.name.toUpperCase())) {
                                console.log(`Looking for department name "${departmentName}" in description "${descUpper}"`,);
                                assignedDepartmentId = d.id;
                            }
                        })

                        console.log(`Row cost_center=${costCenter} assigned_department_id=${assignedDepartmentId} `);

                    }
                    const months = {
                        jan: parseMoneyToString(this.getCellValue(row, ['31-janv.', '31-janv', 'janv', 'jan'])),
                        feb: parseMoneyToString(this.getCellValue(row, ['28-févr.', '28-fevr.', '28-febr', 'fev', 'feb'])),
                        mar: parseMoneyToString(this.getCellValue(row, ['31-mars', '31-mars.', 'mar'])),
                        apr: parseMoneyToString(this.getCellValue(row, ['30-avr.', '30-avr', 'apr'])),
                        may: parseMoneyToString(this.getCellValue(row, ['31-mai', 'mai', 'may'])),
                        jun: parseMoneyToString(this.getCellValue(row, ['30-juin', 'juin', 'jun'])),
                        jul: parseMoneyToString(this.getCellValue(row, ['31-juil.', 'juil', 'jul'])),
                        aug: parseMoneyToString(this.getCellValue(row, ['31-août', '31-aout', 'aout', 'aug'])),
                        sep: parseMoneyToString(this.getCellValue(row, ['30-sept.', '30-sept', 'sept', 'sep'])),
                        oct: parseMoneyToString(this.getCellValue(row, ['31-oct.', '31-oct', 'oct'])),
                        nov: parseMoneyToString(this.getCellValue(row, ['30-nov.', '30-nov', 'nov'])),
                        dec: parseMoneyToString(this.getCellValue(row, ['31-déc.', '31-dec', 'dec', 'déc'])),
                    };

                    // find existing budget by costCenter
                    const existing = await this.budgetDataRepository.findOne({ where: { costCenter } });

                    if (existing) {
                        // update
                        existing.descriptionCc = description || existing.descriptionCc;
                        existing.totalUnits = totalUnits ?? existing.totalUnits;
                        existing.totalBudgetUsd = totalBudget ?? existing.totalBudgetUsd;
                        existing.jan = months.jan ?? existing.jan;
                        existing.feb = months.feb ?? existing.feb;
                        existing.mar = months.mar ?? existing.mar;
                        existing.apr = months.apr ?? existing.apr;
                        existing.may = months.may ?? existing.may;
                        existing.jun = months.jun ?? existing.jun;
                        existing.jul = months.jul ?? existing.jul;
                        existing.aug = months.aug ?? existing.aug;
                        existing.sep = months.sep ?? existing.sep;
                        existing.oct = months.oct ?? existing.oct;
                        existing.nov = months.nov ?? existing.nov;
                        existing.dec = months.dec ?? existing.dec;
                        if (assignedDepartmentId !== null && assignedDepartmentId !== undefined) {
                            existing.assignedDepartment = { id: assignedDepartmentId } as any;
                        }
                        console.log("existing", existing)
                        if (tache) {
                            existing.tache = tache as any;
                            existing.activity = (tache as any).activity ?? existing.activity;
                            existing.sousActivity = (tache as any).sousActivity ?? existing.sousActivity;
                            existing.department = (tache as any).department ?? existing.department;
                        }

                        const beforeSave = { ...existing };
                        const saved = await this.budgetDataRepository.save(existing);
                        this.logger.debug(`Budget updated for costCenter=${costCenter} id=${saved.id} updatedAt=${saved.updatedAt}`);
                        this.logger.debug(`Before save snapshot: ${JSON.stringify(beforeSave)}`);
                        this.logger.debug(`After save snapshot: ${JSON.stringify(saved)}`);
                        recordsUpdated++;
                    } else {
                        // create
                        const b: any = this.budgetDataRepository.create({
                            costCenter: costCenter,
                            descriptionCc: description || null,
                            provinceVille: this.getCellValue(row, ['Province & Ville', 'Province', 'Ville']) || null,
                            coordinationsProvinciales: this.getCellValue(row, ['Coordinations provinciales', 'Coordinations Provinciales']) || null,
                            localEtranger: this.getCellValue(row, ['Local / Etranger ?', 'Local / Etranger', 'Local / Etranger']) || null,
                            categorieGrade: this.getCellValue(row, ['Catégorie / Grade', 'Categorie / Grade']) || null,
                            natureDepenses: this.getCellValue(row, ['Nature Depenses', 'Nature des depenses']) || null,
                            accountOhada: this.getCellValue(row, ['Account Ohada']) || null,
                            departement: this.getCellValue(row, ['Departement', 'DEPARTEMENT', 'DEPARTMENT']) || (tache?.department && (tache.department as any).name) || null,
                            texteLibelle: this.getCellValue(row, ['Texte / Libelle', 'Texte', 'Libelle']) || null,
                            uniteMesure: this.getCellValue(row, ['Unite de Mesure des donnees mensuelles', 'Unite de Mesure']) || null,
                            coutUnitaireUsd: parseMoneyToString(this.getCellValue(row, ['Cout Unitaire en USD Hors Taxe', 'Cout Unitaire en USD'])) || null,
                            jan: months.jan || null,
                            feb: months.feb || null,
                            mar: months.mar || null,
                            apr: months.apr || null,
                            may: months.may || null,
                            jun: months.jun || null,
                            jul: months.jul || null,
                            aug: months.aug || null,
                            sep: months.sep || null,
                            oct: months.oct || null,
                            nov: months.nov || null,
                            dec: months.dec || null,
                            totalUnits: totalUnits || null,
                            totalBudgetUsd: totalBudget || null,
                            assignedDepartment: assignedDepartmentId ? ({ id: assignedDepartmentId } as any) : null,
                        });

                        if (tache) {
                            b.tache = tache as any;
                            b.activity = (tache as any).activity ?? null;
                            b.sousActivity = (tache as any).sousActivity ?? null;
                            b.department = (tache as any).department ?? null;
                        }

                        const created = await this.budgetDataRepository.save(b);
                        this.logger.debug(`Budget created for costCenter=${costCenter} id=${created.id} createdAt=${created.createdAt}`);
                        this.logger.debug(`Created snapshot: ${JSON.stringify(created)}`);
                        recordsCreated++;
                    }
                }

            } catch (error) {
                errors.push(`Row processing error: ${error.message}`);
                recordsSkipped++;
            }
        }

        return {
            success: errors.length === 0 || recordsCreated + recordsUpdated > 0,
            recordsProcessed: sheetData.length,
            recordsCreated,
            recordsUpdated,
            recordsSkipped,
            errors,
        };
    }



    private parseDescriptionCC(description: string): {
        departmentName: string;
        activityName: string | null;
        sousActivityName: string | null;
        tacheName: string | null;
    } {
        if (!description) {
            return { departmentName: '', activityName: null, sousActivityName: null, tacheName: null };
        }

        const parts = description.split('_').map(p => p.trim()).filter(p => p !== '');

        return {
            departmentName: parts[0] || '',
            activityName: parts[1] || null,
            sousActivityName: parts[2] || null,
            tacheName: parts[3] || null,
        };
    }

    /**
     * Create sync result object
     */
    private createSyncResult(
        configId: number,
        startTime: Date,
        data: any,
    ): SyncResult {
        const endTime = data.endTime || new Date();
        return {
            configId,
            startTime,
            endTime,
            duration: endTime.getTime() - startTime.getTime(),
            ...data,
        };
    }

    /**
     * Manual sync trigger
     */
    async triggerManualSync(configId: number): Promise<SyncResult> {
        this.logger.log(`Manual sync triggered for config ${configId}`);
        return this.syncSheet(configId);
    }

    /**
     * Sync all active configurations
     */
    async syncAll(): Promise<SyncResult[]> {
        const activeConfigs = await this.sheetConfigRepository.find({
            where: { isActive: true },
        });

        const results: SyncResult[] = [];

        for (const config of activeConfigs) {
            try {
                const result = await this.syncSheet(config.id);
                results.push(result);
            } catch (error) {
                this.logger.error(`Sync failed for config ${config.id}`, error);
            }
        }

        return results;
    }

    /**
     * Get sync status for a configuration
     */
    async getSyncStatus(configId: number): Promise<{
        inProgress: boolean;
        lastSync: Date | null;
        lastStatus: string | null;
    }> {
        const config = await this.sheetConfigRepository.findOne({
            where: { id: configId },
        });

        return {
            inProgress: this.syncInProgress.get(configId) || false,
            lastSync: config?.lastSyncAt || null,
            lastStatus: config?.lastSyncStatus || null,
        };
    }

}
