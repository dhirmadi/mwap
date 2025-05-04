import "@jest/globals";
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { initCoreV2, applyErrorHandling } from '../init';
import { AppError } from '../errors';
import type { User } from '../../middleware-v2/auth/types';

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock Auth0 configuration
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.AUTH0_AUDIENCE = 'test-api';

describe('Core V2 Integration', () => {
  let app: express.Application;
  const mockUser: User = {
    sub: 'auth0|123',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockImplementation(() => mockUser);

    // Create fresh app instance
    app = express();
    await initCoreV2(app);

    // Add test routes
    app.get('/public', (_req, res) => res.json({ ok: true }));

    app.get('/secure', (req, res) => {
      if (!req.user) {
        throw AppError.unauthorized();
      }
      res.json({ user: req.user });
    });

    app.post('/data', express.json(), (req, res) => {
      res.json({ received: req.body });
    });

    // Apply error handling
    applyErrorHandling(app);
  });

  describe('Security Headers', () => {
    it('should apply security headers to all routes', async () => {
      const response = await request(app)
        .get('/public')
        .expect(200);

      // Check security headers
      expect(response.headers).toMatchObject({
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
      });
    });

    it('should apply CORS headers for allowed origins', async () => {
      const response = await request(app)
        .get('/public')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin'])
        .toBe('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials'])
        .toBe('true');
    });

    it('should block requests from disallowed origins', async () => {
      await request(app)
        .get('/public')
        .set('Origin', 'http://evil.com')
        .expect(response => {
          expect(response.headers['access-control-allow-origin'])
            .toBeUndefined();
        });
    });
  });

  describe('Authentication', () => {
    const validToken = 'valid.jwt.token';

    it('should allow access to public routes without token', async () => {
      await request(app)
        .get('/public')
        .expect(200);
    });

    it('should attach user to request when valid token provided', async () => {
      const response = await request(app)
        .get('/secure')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.user).toEqual(mockUser);
      expect(jwt.verify).toHaveBeenCalledWith(
        validToken,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should reject invalid tokens', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/secure')
        .set('Authorization', 'Bearer invalid.token')
        .expect(401);

      expect(response.body.error).toMatchObject({
        code: 'INVALID_TOKEN',
        message: expect.stringContaining('token'),
      });
    });

    it('should handle missing token for protected routes', async () => {
      const response = await request(app)
        .get('/secure')
        .expect(401);

      expect(response.body.error).toMatchObject({
        code: 'UNAUTHORIZED',
        message: expect.stringContaining('token'),
      });
    });

    it('should handle malformed authorization header', async () => {
      const response = await request(app)
        .get('/secure')
        .set('Authorization', 'NotBearer token')
        .expect(401);

      expect(response.body.error).toMatchObject({
        code: 'INVALID_TOKEN',
        message: expect.stringContaining('Bearer'),
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting headers', async () => {
      const response = await request(app)
        .get('/public')
        .expect(200);

      expect(response.headers).toMatchObject({
        'x-ratelimit-limit': expect.any(String),
        'x-ratelimit-remaining': expect.any(String),
      });
    });

    it('should block requests exceeding rate limit', async () => {
      // Make requests until rate limit is exceeded
      const requests = Array(101).fill(null);
      for (const _ of requests) {
        const response = await request(app).get('/public');
        if (response.status === 429) {
          expect(response.body.error).toMatchObject({
            code: 'RATE_LIMIT_EXCEEDED',
            message: expect.stringContaining('too many requests'),
          });
          return;
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/data')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: expect.any(String),
        message: expect.stringContaining('JSON'),
      });
    });

    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/non-existent')
        .expect(404);

      expect(response.body.error).toMatchObject({
        code: 'NOT_FOUND',
        message: expect.stringContaining('not found'),
      });
    });

    it('should handle unexpected errors', async () => {
      // Add route that throws error
      app.get('/error', () => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body.error).toMatchObject({
        code: 'INTERNAL_ERROR',
        message: expect.stringContaining('unexpected error'),
      });
    });
  });

  describe('Content Type Handling', () => {
    it('should parse JSON bodies', async () => {
      const data = { test: 'value' };
      const response = await request(app)
        .post('/data')
        .send(data)
        .expect(200);

      expect(response.body.received).toEqual(data);
    });

    it('should handle large payloads', async () => {
      const largeData = { data: 'x'.repeat(1024 * 1024) }; // 1MB
      await request(app)
        .post('/data')
        .send(largeData)
        .expect(200);
    });

    it('should reject oversized payloads', async () => {
      const tooLargeData = { data: 'x'.repeat(11 * 1024 * 1024) }; // 11MB
      const response = await request(app)
        .post('/data')
        .send(tooLargeData)
        .expect(413);

      expect(response.body.error).toMatchObject({
        code: expect.any(String),
        message: expect.stringContaining('size'),
      });
    });
  });

  describe('Middleware Order', () => {
    it('should execute middleware in correct order', async () => {
      const order: string[] = [];
      const trackMiddleware = (name: string) => (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        order.push(name);
        next();
      };

      // Create new app with tracking
      const app = express();
      app.use(trackMiddleware('pre-core'));
      
      await initCoreV2(app);
      
      app.use(trackMiddleware('post-core'));
      app.get('/test', (_req, res) => res.json({ ok: true }));
      
      applyErrorHandling(app);

      // Make request
      await request(app)
        .get('/test')
        .expect(200);

      // Verify order
      expect(order).toEqual([
        'pre-core',
        'post-core',
      ]);
    });
  });

  describe('Environment Awareness', () => {
    it('should adjust behavior based on NODE_ENV', async () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test production mode
      process.env.NODE_ENV = 'production';
      let app = express();
      await initCoreV2(app);
      applyErrorHandling(app);
      
      app.get('/error', () => {
        throw new Error('Secret error');
      });

      let response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body.error.details).toBeUndefined();

      // Test development mode
      process.env.NODE_ENV = 'development';
      app = express();
      await initCoreV2(app);
      applyErrorHandling(app);
      
      app.get('/error', () => {
        throw new Error('Secret error');
      });

      response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body.error.details).toBe('Secret error');

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Complete Middleware Pipeline', () => {
    it('should handle a complete request through all middleware', async () => {
      // Setup test route that requires auth
      app.post('/api/items', 
        (req, res) => {
          if (!req.user) throw AppError.unauthorized();
          res.json({ success: true, user: req.user });
        }
      );

      // 1. Test CORS preflight
      await request(app)
        .options('/api/items')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204)
        .expect('Access-Control-Allow-Origin', 'http://localhost:5173')
        .expect('Access-Control-Allow-Methods', /POST/);

      // 2. Test unauthorized access
      const unauthorizedResponse = await request(app)
        .post('/api/items')
        .set('Origin', 'http://localhost:5173')
        .expect(401);
      
      expect(unauthorizedResponse.body.error).toMatchObject({
        code: 'UNAUTHORIZED',
        message: expect.any(String)
      });

      // 3. Test with valid token
      const authorizedResponse = await request(app)
        .post('/api/items')
        .set('Origin', 'http://localhost:5173')
        .set('Authorization', `Bearer valid.jwt.token`)
        .expect(200);

      // Verify response and headers
      expect(authorizedResponse.body).toEqual({
        success: true,
        user: mockUser
      });
      expect(authorizedResponse.headers).toMatchObject({
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'x-ratelimit-limit': expect.any(String),
        'x-ratelimit-remaining': expect.any(String),
        'access-control-allow-origin': 'http://localhost:5173'
      });

      // 4. Test 404 for non-existent route
      const notFoundResponse = await request(app)
        .get('/api/non-existent')
        .set('Origin', 'http://localhost:5173')
        .expect(404);

      expect(notFoundResponse.body.error).toMatchObject({
        code: 'NOT_FOUND',
        message: expect.stringContaining('not found')
      });
    });
  });
});