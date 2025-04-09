import { createClient } from 'redis';
import { logger } from '../utils/logger';

class CacheService {
  private client;
  private readonly defaultTTL = 300; // 5 minutes
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Redis Connection Error:', error);
    }
  }

  /**
   * Generate cache key for tenant data
   */
  private getTenantKey(tenantId: string): string {
    return `tenant:${tenantId}`;
  }

  private getUserTenantsKey(userId: string): string {
    return `user:${userId}:tenants`;
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache Get Error:', { key, error });
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache Set Error:', { key, error });
    }
  }

  /**
   * Delete data from cache
   */
  async del(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache Delete Error:', { key, error });
    }
  }

  /**
   * Invalidate tenant cache
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    const key = this.getTenantKey(tenantId);
    await this.del(key);
    
    // Also invalidate pattern for user tenant lists
    try {
      const keys = await this.client.keys('user:*:tenants');
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Cache Pattern Delete Error:', { pattern: 'user:*:tenants', error });
    }
  }

  /**
   * Invalidate user's tenant list
   */
  async invalidateUserTenants(userId: string): Promise<void> {
    const key = this.getUserTenantsKey(userId);
    await this.del(key);
  }

  /**
   * Cache tenant data
   */
  async cacheTenant(tenantId: string, data: any): Promise<void> {
    const key = this.getTenantKey(tenantId);
    await this.set(key, data);
  }

  /**
   * Cache user's tenant list
   */
  async cacheUserTenants(userId: string, tenants: any[]): Promise<void> {
    const key = this.getUserTenantsKey(userId);
    await this.set(key, tenants);
  }
}

// Export singleton instance
export const cacheService = new CacheService();