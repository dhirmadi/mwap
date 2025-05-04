import "@jest/globals";
import { getCache, setCache, deleteCache, clearCache } from '../../cache/redis';
import { createMockRedis } from '../utils/mockRedis';
import { mockLoggerFactory } from '../utils/mockLogger';

describe('Redis Cache Module', () => {
  const mockRedis = createMockRedis();
  const mockLogger = mockLoggerFactory();

  beforeAll(() => {
    mockRedis.reconnect();
  });

  afterAll(() => {
    mockRedis.disconnect();
  });

  beforeEach(async () => {
    await mockRedis.flushall();
    jest.clearAllMocks();
  });

  describe('getCache', () => {
    it('should return null for non-existent key', async () => {
      const result = await getCache('non-existent');
      expect(result).toBeNull();
    });

    it('should return parsed value for existing key', async () => {
      const testData = { test: 'data' };
      await mockRedis.set('test-key', JSON.stringify(testData));
      
      const result = await getCache('test-key');
      expect(result).toEqual(testData);
    });

    it('should handle invalid JSON', async () => {
      await mockRedis.set('invalid-json', 'invalid{json');
      
      const result = await getCache('invalid-json');
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      mockRedis.simulateError(new Error('Redis error'));
      
      const result = await getCache('test-key');
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('setCache', () => {
    it('should store value with default TTL', async () => {
      const testData = { test: 'data' };
      await setCache('test-key', testData);
      
      const stored = await mockRedis.get('test-key');
      expect(JSON.parse(stored!)).toEqual(testData);
    });

    it('should store value with custom TTL', async () => {
      const testData = { test: 'data' };
      await setCache('test-key', testData, 60);
      
      const stored = await mockRedis.get('test-key');
      expect(JSON.parse(stored!)).toEqual(testData);
    });

    it('should handle Redis errors', async () => {
      mockRedis.simulateError(new Error('Redis error'));
      
      await setCache('test-key', { test: 'data' });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('deleteCache', () => {
    it('should delete existing key', async () => {
      await mockRedis.set('test-key', 'test-data');
      await deleteCache('test-key');
      
      const result = await mockRedis.get('test-key');
      expect(result).toBeNull();
    });

    it('should handle non-existent key', async () => {
      await deleteCache('non-existent');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      mockRedis.simulateError(new Error('Redis error'));
      
      await deleteCache('test-key');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear all keys', async () => {
      await mockRedis.set('key1', 'value1');
      await mockRedis.set('key2', 'value2');
      
      await clearCache();
      
      const result1 = await mockRedis.get('key1');
      const result2 = await mockRedis.get('key2');
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should handle Redis errors', async () => {
      mockRedis.simulateError(new Error('Redis error'));
      
      await clearCache();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Redis connection events', () => {
    it('should handle connection events', () => {
      mockRedis.disconnect();
      expect(mockLogger.warn).toHaveBeenCalledWith('Redis connection closed');

      mockRedis.reconnect();
      expect(mockLogger.info).toHaveBeenCalledWith('Connected to Redis');
      expect(mockLogger.info).toHaveBeenCalledWith('Redis client ready');
    });

    it('should handle error events', () => {
      const error = new Error('Redis error');
      mockRedis.simulateError(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Redis connection error:', error);
    });
  });
});