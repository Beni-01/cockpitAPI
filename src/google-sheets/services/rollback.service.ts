import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SyncSnapshot } from '../entities/sync-snapshot.entity';
import { BudgetData } from '../entities/budget-data.entity';
import * as crypto from 'crypto';

export interface RollbackResult {
    success: boolean;
    message: string;
    recordsRestored: number;
    snapshotId: number;
    configId: number;
}

@Injectable()
export class RollbackService {
    private readonly logger = new Logger(RollbackService.name);

    constructor(
        @InjectRepository(SyncSnapshot)
        private snapshotRepository: Repository<SyncSnapshot>,
        @InjectRepository(BudgetData)
        private budgetDataRepository: Repository<BudgetData>,
        private dataSource: DataSource,
    ) { }

    /**
     * Create a snapshot before sync
     */
    async createSnapshot(
        configId: number,
        syncLogId?: number,
        snapshotType: 'pre_sync' | 'post_sync' | 'manual' = 'pre_sync',
        description?: string,
    ): Promise<SyncSnapshot> {
        try {
            this.logger.log(`Creating ${snapshotType} snapshot for config ${configId}`);

            // Fetch current data
            const currentData = await this.budgetDataRepository.find({
                where: { config_id: configId },
                order: { id: 'ASC' },
            });

            // Serialize data
            const snapshotData = JSON.stringify(currentData);

            // Calculate hash for integrity verification
            const hash = crypto
                .createHash('sha256')
                .update(snapshotData)
                .digest('hex');

            // Calculate expiration (30 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            // Create snapshot
            const snapshot = this.snapshotRepository.create({
                config_id: configId,
                sync_log_id: syncLogId,
                snapshot_data: snapshotData,
                record_count: currentData.length,
                snapshot_hash: hash,
                snapshot_type: snapshotType,
                description: description || `${snapshotType} snapshot`,
                created_by: 'system',
                expires_at: expiresAt,
            });

            const saved = await this.snapshotRepository.save(snapshot);

            this.logger.log(
                `Snapshot created: ID ${saved.id}, Records: ${saved.record_count}, Hash: ${hash.substring(0, 8)}...`
            );

            return saved;
        } catch (error) {
            this.logger.error(`Failed to create snapshot: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Rollback to a specific snapshot
     */
    async rollback(snapshotId: number): Promise<RollbackResult> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Fetch snapshot
            const snapshot = await this.snapshotRepository.findOne({
                where: { id: snapshotId },
            });

            if (!snapshot) {
                throw new NotFoundException(`Snapshot ${snapshotId} not found`);
            }

            if (snapshot.is_restored) {
                throw new Error(`Snapshot ${snapshotId} has already been restored`);
            }

            this.logger.log(`Starting rollback to snapshot ${snapshotId} for config ${snapshot.config_id}`);

            // Verify snapshot integrity
            const currentHash = crypto
                .createHash('sha256')
                .update(snapshot.snapshot_data)
                .digest('hex');

            if (currentHash !== snapshot.snapshot_hash) {
                throw new Error('Snapshot data integrity check failed');
            }

            // Parse snapshot data
            const snapshotData = JSON.parse(snapshot.snapshot_data);

            // Create a new snapshot of current state before rollback
            await this.createSnapshot(
                snapshot.config_id,
                undefined,
                'manual',
                `Pre-rollback snapshot (rolling back to snapshot ${snapshotId})`
            );

            // Delete current data for this config
            await queryRunner.manager.delete(BudgetData, {
                config_id: snapshot.config_id,
            });

            // Restore snapshot data
            if (snapshotData.length > 0) {
                // Remove IDs to let database generate new ones
                const dataToRestore = snapshotData.map((item: any) => {
                    const { id, ...rest } = item;
                    return rest;
                });

                await queryRunner.manager.save(BudgetData, dataToRestore);
            }

            // Mark snapshot as restored
            snapshot.is_restored = true;
            snapshot.restored_at = new Date();
            await queryRunner.manager.save(SyncSnapshot, snapshot);

            // Commit transaction
            await queryRunner.commitTransaction();

            this.logger.log(
                `Rollback successful: ${snapshotData.length} records restored for config ${snapshot.config_id}`
            );

            return {
                success: true,
                message: 'Rollback completed successfully',
                recordsRestored: snapshotData.length,
                snapshotId: snapshot.id,
                configId: snapshot.config_id,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Rollback failed: ${error.message}`, error.stack);

            return {
                success: false,
                message: `Rollback failed: ${error.message}`,
                recordsRestored: 0,
                snapshotId,
                configId: 0,
            };
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Get available snapshots for a config
     */
    async getSnapshots(configId: number, limit: number = 10): Promise<SyncSnapshot[]> {
        return this.snapshotRepository.find({
            where: { config_id: configId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }

    /**
     * Get snapshot details
     */
    async getSnapshotDetails(snapshotId: number): Promise<{
        snapshot: SyncSnapshot;
        preview: any[];
    }> {
        const snapshot = await this.snapshotRepository.findOne({
            where: { id: snapshotId },
        });

        if (!snapshot) {
            throw new NotFoundException(`Snapshot ${snapshotId} not found`);
        }

        // Parse data for preview (first 5 records)
        const data = JSON.parse(snapshot.snapshot_data);
        const preview = data.slice(0, 5);

        return {
            snapshot,
            preview,
        };
    }

    /**
     * Compare current state with a snapshot
     */
    async compareWithSnapshot(snapshotId: number): Promise<{
        snapshot: SyncSnapshot;
        differences: {
            added: number;
            removed: number;
            modified: number;
            unchanged: number;
        };
    }> {
        const snapshot = await this.snapshotRepository.findOne({
            where: { id: snapshotId },
        });

        if (!snapshot) {
            throw new NotFoundException(`Snapshot ${snapshotId} not found`);
        }

        // Get current data
        const currentData = await this.budgetDataRepository.find({
            where: { config_id: snapshot.config_id },
        });

        // Parse snapshot data
        const snapshotData = JSON.parse(snapshot.snapshot_data);

        // Create maps for comparison
        const snapshotMap = new Map(
            snapshotData.map((item: any) => [item.id, item])
        );
        const currentMap = new Map(
            currentData.map(item => [item.id, item])
        );

        let added = 0;
        let removed = 0;
        let modified = 0;
        let unchanged = 0;

        // Check for added and modified
        currentData.forEach(current => {
            if (!snapshotMap.has(current.id)) {
                added++;
            } else {
                const snapshotItem = snapshotMap.get(current.id);
                if (JSON.stringify(current) !== JSON.stringify(snapshotItem)) {
                    modified++;
                } else {
                    unchanged++;
                }
            }
        });

        // Check for removed
        snapshotData.forEach((item: any) => {
            if (!currentMap.has(item.id)) {
                removed++;
            }
        });

        return {
            snapshot,
            differences: {
                added,
                removed,
                modified,
                unchanged,
            },
        };
    }

    /**
     * Delete old snapshots (cleanup)
     */
    async cleanupOldSnapshots(): Promise<number> {
        const result = await this.snapshotRepository
            .createQueryBuilder()
            .delete()
            .where('expires_at < :now', { now: new Date() })
            .andWhere('is_restored = :restored', { restored: false })
            .execute();

        this.logger.log(`Cleaned up ${result.affected} expired snapshots`);
        return result.affected || 0;
    }

    /**
     * Delete snapshots for a specific config
     */
    async deleteSnapshotsForConfig(configId: number): Promise<number> {
        const result = await this.snapshotRepository.delete({ config_id: configId });
        return result.affected || 0;
    }
}
