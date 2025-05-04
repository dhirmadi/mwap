// Mock environment variables
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.AUTH0_AUDIENCE = 'test-api';
process.env.NODE_ENV = 'test';

// Increase timeout for rate limit tests
jest.setTimeout(10000);

// Mock logger to capture output
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));