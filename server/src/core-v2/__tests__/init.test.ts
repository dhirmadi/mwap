import express from 'express';
import request from 'supertest';
import { initCoreV2, applyErrorHandling } from '../init';
import { AppError } from '../errors';

// Mock dependencies
jest.mock('../../middleware-v2/security', () => ({
  applySecurity: jest.fn().mockImplementation(app => app),
}));

jest.mock('../../middleware-v2/auth/extractUser', () => ({
  extractUser: jest.fn((req, res, next) => next()),
}));

jest.mock('../../logging-v2', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Core V2 Initialization', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe('initCoreV2', () => {
    it('should initialize core middleware', async () => {
      const initialized = await initCoreV2(app);

      // Add test route
      initialized.get('/test', (_req, res) => res.json({ ok: true }));

      // Apply error handling
      applyErrorHandling(initialized);

      // Test the endpoint
      const response = await request(initialized)
        .get('/test')
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });

    it('should handle initialization errors', async () => {
      const mockError = new Error('Security initialization failed');
      
      // Mock security initialization failure
      jest.requireMock('../../middleware-v2/security').applySecurity
        .mockRejectedValueOnce(mockError);

      await expect(initCoreV2(app)).rejects.toThrow(mockError);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      app = await initCoreV2(express());
    });

    it('should handle 404 errors', async () => {
      // Apply error handling
      applyErrorHandling(app);

      const response = await request(app)
        .get('/non-existent')
        .expect(404);

      expect(response.body).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: expect.stringContaining('Route not found'),
        },
      });
    });

    it('should handle AppError instances', async () => {
      // Add route that throws AppError
      app.get('/error', () => {
        throw AppError.forbidden('Access denied');
      });

      // Apply error handling
      applyErrorHandling(app);

      const response = await request(app)
        .get('/error')
        .expect(403);

      expect(response.body).toEqual({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
        },
      });
    });

    it('should handle unexpected errors', async () => {
      // Add route that throws unexpected error
      app.get('/error', () => {
        throw new Error('Unexpected error');
      });

      // Apply error handling
      applyErrorHandling(app);

      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          ...(process.env.NODE_ENV === 'development' && {
            details: 'Unexpected error',
          }),
        },
      });
    });

    it('should preserve error details in development', async () => {
      // Store original NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Add route that throws error with details
      app.get('/error', () => {
        throw new Error('Detailed error message');
      });

      // Apply error handling
      applyErrorHandling(app);

      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body.error.details).toBe('Detailed error message');

      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Middleware Order', () => {
    it('should apply middleware in correct order', async () => {
      const middlewareOrder: string[] = [];

      // Mock middleware to track order
      const trackMiddleware = (name: string) => (
        _req: express.Request,
        _res: express.Response,
        next: express.NextFunction
      ) => {
        middlewareOrder.push(name);
        next();
      };

      // Create test app with tracking
      const app = express();
      app.use(trackMiddleware('pre-core'));

      // Initialize core
      const initialized = await initCoreV2(app);
      initialized.use(trackMiddleware('post-core'));

      // Add routes
      initialized.get('/test', (_req, res) => res.json({ ok: true }));
      initialized.use(trackMiddleware('post-routes'));

      // Apply error handling
      applyErrorHandling(initialized);

      // Make test request
      await request(initialized)
        .get('/test')
        .expect(200);

      // Verify middleware order
      expect(middlewareOrder).toEqual([
        'pre-core',
        'post-core',
        'post-routes',
      ]);
    });
  });
});