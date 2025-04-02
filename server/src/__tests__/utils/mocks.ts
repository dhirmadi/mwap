import { Express } from 'express';

// Mock security middleware
export const mockSetupSecurity = jest.fn((app: Express) => {
  // Do nothing in tests
});

// Mock environment
export const mockEnvironment = {
  isDevelopment: jest.fn().mockReturnValue(true),
  getEnvironmentName: jest.fn().mockReturnValue('test'),
  server: {
    port: 3000
  }
};

// Mock the modules
jest.mock('../../middleware/security', () => ({
  setupSecurity: jest.fn()
}));

jest.mock('../../config/environment', () => ({
  __esModule: true,
  default: {
    isDevelopment: () => true,
    getEnvironmentName: () => 'test',
    server: {
      port: 3000
    }
  }
}));