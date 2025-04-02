import { app } from '../../app';
import request from 'supertest';

// Mock environment variables
process.env.AUTH0_AUDIENCE = 'https://api.test.local';
process.env.AUTH0_DOMAIN = 'test.auth0.com';

// Mock express-oauth2-jwt-bearer
jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token === 'valid-token') {
      req.auth = {
        sub: 'auth0|123456789',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}));

// Create a type-safe test client
export type TestClient = request.SuperTest<request.Test>;

export function createTestClient(): TestClient {
  return request(app);
}

// Global test setup
beforeAll(() => {
  jest.resetModules();
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});