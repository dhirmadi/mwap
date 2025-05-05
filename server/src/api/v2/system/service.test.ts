import "@jest/globals";
import mongoose from 'mongoose';
import { SystemService } from './service';

// Mock mongoose connection
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1
  }
}));

describe('SystemService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getSystemStatus', () => {
    it('should return connected status when mongoose is connected', () => {
      const status = SystemService.getSystemStatus();

      expect(status.db).toBe('connected');
      expect(typeof status.uptime).toBe('number');
      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return disconnected status when mongoose is disconnected', () => {
      // Mock disconnected state
      (mongoose.connection as any).readyState = 0;

      const status = SystemService.getSystemStatus();

      expect(status.db).toBe('disconnected');
      expect(typeof status.uptime).toBe('number');

      // Reset mock
      (mongoose.connection as any).readyState = 1;
    });
  });

  describe('getSystemVersion', () => {
    it('should return version info from environment variables', () => {
      process.env.VERSION = '1.2.3';
      process.env.BUILD_ID = 'abc123';
      process.env.NODE_ENV = 'test';

      const version = SystemService.getSystemVersion();

      expect(version).toEqual({
        version: '1.2.3',
        build: 'abc123',
        environment: 'test'
      });
    });

    it('should return default values when env vars are not set', () => {
      delete process.env.VERSION;
      delete process.env.BUILD_ID;
      delete process.env.NODE_ENV;

      const version = SystemService.getSystemVersion();

      expect(version).toEqual({
        version: '0.0.0',
        build: 'development',
        environment: 'development'
      });
    });
  });

  describe('getSystemFeatures', () => {
    it('should return feature flags with expected structure', () => {
      const features = SystemService.getSystemFeatures();

      expect(features).toEqual({
        auth: {
          mfa: expect.any(Boolean),
          sso: expect.any(Boolean)
        },
        storage: {
          providers: expect.any(Array),
          encryption: expect.any(Boolean)
        },
        projects: {
          sharing: expect.any(Boolean),
          templates: expect.any(Boolean)
        }
      });

      // Validate storage providers
      expect(features.storage.providers).toEqual(
        expect.arrayContaining(['dropbox', 'gdrive', 'onedrive'])
      );
    });

    it('should return consistent feature flags', () => {
      const features1 = SystemService.getSystemFeatures();
      const features2 = SystemService.getSystemFeatures();

      expect(features1).toEqual(features2);
    });
  });
});