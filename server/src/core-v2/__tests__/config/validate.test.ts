import "@jest/globals";
import { validateEnv, getConfig } from '../../config/validate';
import { mockEnv, clearEnv } from '../utils/mockEnv';

describe('Config Validation Module', () => {
  const validConfig = {
    NODE_ENV: 'test',
    PORT: '3000',
    MONGODB_URI: 'mongodb://localhost:27017/mwap-test',
    REDIS_URL: 'redis://localhost:6379',
    AUTH0_DOMAIN: 'https://mwap.auth0.com',
    AUTH0_CLIENT_ID: 'test-client-id',
    AUTH0_CLIENT_SECRET: 'test-client-secret',
    AUTH0_AUDIENCE: 'https://api.mwap.com',
    STORAGE_PROVIDER: 'dropbox',
    STORAGE_API_KEY: 'test-storage-key',
    LOG_LEVEL: 'error'
  };

  describe('validateEnv', () => {
    beforeEach(() => {
      jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        throw new Error(`Process.exit(${code})`);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should validate valid environment variables', () => {
      mockEnv(validConfig);
      const config = validateEnv();
      
      expect(config).toEqual({
        ...validConfig,
        API_VERSION: 'v2' // Default value
      });
    });

    it('should use default values when optional variables are missing', () => {
      const minimalConfig = {
        AUTH0_DOMAIN: 'https://mwap.auth0.com',
        AUTH0_CLIENT_ID: 'test-client-id',
        AUTH0_CLIENT_SECRET: 'test-client-secret',
        AUTH0_AUDIENCE: 'https://api.mwap.com',
        STORAGE_API_KEY: 'test-storage-key'
      };

      mockEnv(minimalConfig);
      const config = validateEnv();
      
      expect(config).toMatchObject({
        NODE_ENV: 'development',
        PORT: '3000',
        API_VERSION: 'v2',
        MONGODB_URI: 'mongodb://localhost:27017/mwap',
        REDIS_URL: 'redis://localhost:6379',
        STORAGE_PROVIDER: 'dropbox',
        LOG_LEVEL: 'info'
      });
    });

    it('should throw error for invalid URLs', () => {
      mockEnv({
        ...validConfig,
        MONGODB_URI: 'invalid-url'
      });

      expect(() => validateEnv()).toThrow('Process.exit(1)');
    });

    it('should throw error for invalid enum values', () => {
      mockEnv({
        ...validConfig,
        NODE_ENV: 'invalid',
        STORAGE_PROVIDER: 'invalid'
      });

      expect(() => validateEnv()).toThrow('Process.exit(1)');
    });

    it('should throw error for missing required variables', () => {
      clearEnv([
        'AUTH0_DOMAIN',
        'AUTH0_CLIENT_ID',
        'AUTH0_CLIENT_SECRET',
        'AUTH0_AUDIENCE',
        'STORAGE_API_KEY'
      ]);

      expect(() => validateEnv()).toThrow('Process.exit(1)');
    });
  });

  describe('getConfig', () => {
    it('should return validated config', () => {
      mockEnv(validConfig);
      const config = getConfig();
      
      expect(config).toEqual({
        ...validConfig,
        API_VERSION: 'v2'
      });
    });

    it('should throw error for invalid config', () => {
      mockEnv({
        ...validConfig,
        AUTH0_DOMAIN: 'invalid-url'
      });

      expect(() => getConfig()).toThrow('Process.exit(1)');
    });
  });
});