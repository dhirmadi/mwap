import Redis from 'ioredis';
import { logger } from '../logger';

// Create Redis client
let client: Redis;

if (process.env.NODE_ENV === 'test') {
  // In test environment, the client will be injected by the test
  client = new Redis();
} else {
  client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  // Handle Redis events
  client.on('connect', () => {
    logger.info('Connected to Redis');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  client.on('close', () => {
    logger.warn('Redis connection closed');
  });
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Failed to parse cached value:', error);
      return null;
    }
  } catch (error) {
    logger.error('Failed to get from cache:', error);
    return null;
  }
}

/**
 * Set value in cache with optional TTL
 */
export async function setCache<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await client.set(key, serialized, 'EX', ttlSeconds);
  } catch (error) {
    logger.error('Failed to set cache:', error);
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await client.del(key);
  } catch (error) {
    logger.error('Failed to delete from cache:', error);
  }
}

/**
 * Clear all cache
 */
export async function clearCache(): Promise<void> {
  try {
    await client.flushall();
  } catch (error) {
    logger.error('Failed to clear cache:', error);
  }
}

export default client;