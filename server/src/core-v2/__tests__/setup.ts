import '@jest/globals';

// Increase timeout for rate limit tests
jest.setTimeout(10000);

// Set default environment variables for tests
process.env = {
  ...process.env,
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
  LOG_LEVEL: 'error',
  ENCRYPTION_KEY: 'test-encryption-key'
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});