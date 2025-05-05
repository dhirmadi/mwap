import "@jest/globals";
import express from 'express';
import request from 'supertest';
import { applySecurity, helmetConfig, corsConfig, createRateLimiter } from '../index';
import { AppError } from '../../../core-v2/errors';

describe('Security Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe('Helmet Configuration', () => {
    it('should have secure CSP directives', () => {
      expect(helmetConfig.contentSecurityPolicy?.directives).toMatchObject({
        defaultSrc: ["'self'"],
        scriptSrc: expect.arrayContaining(["'self'"]),
        styleSrc: expect.arrayContaining(["'self'"]),
        objectSrc: ["'none'"],
      });
    });

    it('should allow Auth0 domains', () => {
      expect(helmetConfig.contentSecurityPolicy?.directives.connectSrc)
        .toEqual(expect.arrayContaining(['https://*.auth0.com']));
      expect(helmetConfig.contentSecurityPolicy?.directives.frameSrc)
        .toEqual(expect.arrayContaining(['https://*.auth0.com']));
    });
  });

  describe('CORS Configuration', () => {
    it('should allow specified origins', () => {
      expect(corsConfig.origin).toEqual(expect.arrayContaining([
        'http://localhost:5173',
        expect.any(RegExp), // Heroku domains regex
      ]));
    });

    it('should enable credentials', () => {
      expect(corsConfig.credentials).toBe(true);
    });

    it('should expose rate limit headers', () => {
      expect(corsConfig.exposedHeaders).toEqual(expect.arrayContaining([
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
      ]));
    });
  });

  describe('Rate Limiter', () => {
    it('should create memory-based rate limiter', async () => {
      const limiter = await createRateLimiter();
      expect(limiter).toBeDefined();
    });

    it('should use default limits', async () => {
      const limiter = await createRateLimiter();
      expect(limiter.options.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(limiter.options.max).toBe(100);
    });

    it('should throw error for Redis without config', async () => {
      await expect(createRateLimiter({ url: 'redis://invalid:6379' }))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('applySecurity', () => {
    it('should apply all middleware', async () => {
      // Create test endpoint
      app.get('/test', (_req, res) => res.json({ ok: true }));

      // Apply security middleware
      await applySecurity(app);

      // Test the endpoint
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:5173');

      // Verify security headers
      expect(response.headers).toMatchObject({
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
      });

      // Verify CORS headers
      expect(response.headers['access-control-allow-origin'])
        .toBe('http://localhost:5173');

      // Verify rate limit headers
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });

    it('should block requests after rate limit', async () => {
      // Create test endpoint
      app.get('/test', (_req, res) => res.json({ ok: true }));

      // Apply security with very low limit
      await applySecurity(app, {
        max: 1,
        windowMs: 1, // 1ms window to ensure rate limit is hit
      });

      // First request should succeed
      await request(app)
        .get('/test')
        .set('x-forwarded-for', '127.0.0.1')
        .expect(200);

      // Second request should be blocked
      const response = await request(app)
        .get('/test')
        .set('x-forwarded-for', '127.0.0.1')
        .expect(429);

      expect(response.body).toMatchObject({
        error: {
          message: expect.any(String),
          code: 'RATE_LIMIT_EXCEEDED',
        },
      });
    });
  });
});