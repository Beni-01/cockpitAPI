import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);
    private readonly DEFAULT_TTL = 300; // 5 minutes in seconds

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.cacheManager.get<T>(key);
            if (value) {
                this.logger.debug(`Cache HIT: ${key}`);
            } else {
                this.logger.debug(`Cache MISS: ${key}`);
            }
            return value || null;
        } catch (error) {
            this.logger.error(`Cache get error for key ${key}: ${error.message}`);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            await this.cacheManager.set(key, value, (ttl || this.DEFAULT_TTL) * 1000);
            this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || this.DEFAULT_TTL}s)`);
        } catch (error) {
            this.logger.error(`Cache set error for key ${key}: ${error.message}`);
        }
    }

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache DEL: ${key}`);
        } catch (error) {
            this.logger.error(`Cache delete error for key ${key}: ${error.message}`);
        }
    }

    /**
     * Delete multiple keys matching pattern
     */
    async delPattern(pattern: string): Promise<void> {
        try {
            // Note: This requires cache-manager-redis-store
            // For memory cache, you'll need to track keys manually
            this.logger.debug(`Cache DEL pattern: ${pattern}`);

            // If using Redis:
            // const keys = await this.cacheManager.store.keys(pattern);
            // await Promise.all(keys.map(key => this.cacheManager.del(key)));
        } catch (error) {
            this.logger.error(`Cache delete pattern error for ${pattern}: ${error.message}`);
        }
    }

    /**
     * Clear all cache
     */
    async reset(): Promise<void> {
        try {
            await this.cacheManager.reset();
            this.logger.log('Cache cleared');
        } catch (error) {
            this.logger.error(`Cache reset error: ${error.message}`);
        }
    }

    /**
     * Get or set (cache-aside pattern)
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Not in cache, fetch from source
        const value = await factory();

        // Store in cache
        await this.set(key, value, ttl);

        return value;
    }

    /**
     * Generate cache key for Google Sheets configs
     */
    getConfigKey(id?: number): string {
        return id ? `google-sheets:config:${id}` : 'google-sheets:config:all';
    }

    /**
     * Generate cache key for sync logs
     */
    getSyncLogsKey(configId?: number): string {
        return configId
            ? `google-sheets:sync-logs:${configId}`
            : 'google-sheets:sync-logs:all';
    }

    /**
     * Generate cache key for budget data
     */
    getBudgetDataKey(configId?: number): string {
        return configId
            ? `google-sheets:budget-data:${configId}`
            : 'google-sheets:budget-data:all';
    }

    /**
     * Generate cache key for departments
     */
    getDepartmentsKey(): string {
        return 'google-sheets:departments';
    }

    /**
     * Generate cache key for activities
     */
    getActivitiesKey(department: string): string {
        return `google-sheets:activities:${department}`;
    }

    /**
     * Generate cache key for audit logs
     */
    getAuditLogsKey(): string {
        return 'google-sheets:audit-logs';
    }

    /**
     * Invalidate config-related caches
     */
    async invalidateConfigCache(configId?: number): Promise<void> {
        const keys = [
            this.getConfigKey(),
            this.getConfigKey(configId),
            this.getSyncLogsKey(),
            this.getBudgetDataKey(),
        ];

        await Promise.all(keys.map(key => this.del(key)));
        this.logger.log(`Invalidated config cache${configId ? ` for config ${configId}` : ''}`);
    }

    /**
     * Invalidate sync-related caches
     */
    async invalidateSyncCache(configId: number): Promise<void> {
        const keys = [
            this.getSyncLogsKey(),
            this.getSyncLogsKey(configId),
            this.getBudgetDataKey(),
            this.getBudgetDataKey(configId),
            this.getAuditLogsKey(),
        ];

        await Promise.all(keys.map(key => this.del(key)));
        this.logger.log(`Invalidated sync cache for config ${configId}`);
    }

    /**
     * Warm up cache with frequently accessed data
     */
    async warmUp(dataFetchers: {
        configs: () => Promise<any>;
        departments: () => Promise<any>;
    }): Promise<void> {
        try {
            this.logger.log('Warming up cache...');

            await Promise.all([
                this.getOrSet(this.getConfigKey(), dataFetchers.configs, 600),
                this.getOrSet(this.getDepartmentsKey(), dataFetchers.departments, 3600),
            ]);

            this.logger.log('Cache warm-up completed');
        } catch (error) {
            this.logger.error(`Cache warm-up failed: ${error.message}`);
        }
    }

    /**
     * Get cache statistics (if supported by cache store)
     */
    async getStats(): Promise<any> {
        try {
            // This depends on the cache store implementation
            // For Redis: return await this.cacheManager.store.getClient().info('stats');
            return { message: 'Stats not available for this cache store' };
        } catch (error) {
            this.logger.error(`Failed to get cache stats: ${error.message}`);
            return null;
        }
    }
}
