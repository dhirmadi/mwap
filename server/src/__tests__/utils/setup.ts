import { app } from '../../app';
import request from 'supertest';
import { 
  connectTestDb, 
  closeTestDb, 
  resetDatabase,
  isDatabaseConnected 
} from './dbUtils';

// Mock environment variables
process.env.AUTH0_AUDIENCE = 'https://api.test.local';
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.NODE_ENV = 'test';

// Mock express-oauth2-jwt-bearer
jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    // No token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    // Invalid token format
    if (!token.startsWith('Bearer ') && !token.startsWith('valid-token-')) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    // Valid token
    if (token.startsWith('valid-token-')) {
      const sub = token.replace('valid-token-', '');
      req.auth = {
        sub,
        email: `test@example.com`,
        name: `Test User`,
        picture: `https://example.com/avatar.jpg`
      };
      return next();
    }

    // Default unauthorized
    return res.status(401).json({ error: 'Unauthorized' });
  }
}));

// Create a type-safe test client
export type TestClient = request.SuperTest<request.Test>;

export function createTestClient(): TestClient {
  return request(app);
}

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Reset modules
  jest.resetModules();

  // Connect to test database
  try {
    await connectTestDb();
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  // Cleanup
  try {
    await closeTestDb();
  } catch (error) {
    console.error('Failed to close test database:', error);
  }
  jest.restoreAllMocks();
}, 30000);

beforeEach(async () => {
  // Reset mocks and database
  jest.clearAllMocks();
  try {
    await resetDatabase();
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}, 10000);