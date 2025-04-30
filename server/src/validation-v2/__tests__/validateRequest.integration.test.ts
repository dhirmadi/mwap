import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validateRequest } from '../validateRequest';
import { globalErrorHandler } from '../../core-v2/errors';

describe('validateRequest Integration', () => {
  const app = express();

  // Test schema
  const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18).optional(),
  });

  // Test routes
  app.post(
    '/users',
    validateRequest(userSchema),
    (req, res) => res.json({ validated: req.validated })
  );

  app.get(
    '/users',
    validateRequest(z.object({
      search: z.string().min(2).optional(),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(100)),
    }), 'query'),
    (req, res) => res.json({ validated: req.validated })
  );

  app.get(
    '/users/:id/:action',
    validateRequest(z.object({
      id: z.string().uuid(),
      action: z.enum(['view', 'edit', 'delete']),
    }), 'params'),
    (req, res) => res.json({ validated: req.validated })
  );

  // Error handler
  app.use(globalErrorHandler);

  describe('POST /users - Body Validation', () => {
    it('should validate and parse valid request body', async () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const response = await request(app)
        .post('/users')
        .send(validUser)
        .expect(200);

      expect(response.body.validated).toEqual(validUser);
    });

    it('should handle optional fields', async () => {
      const validUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const response = await request(app)
        .post('/users')
        .send(validUser)
        .expect(200);

      expect(response.body.validated).toEqual(validUser);
    });

    it('should reject invalid data with 400 status', async () => {
      const invalidUser = {
        name: 'J', // too short
        email: 'not-an-email',
        age: 16, // too young
      };

      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.any(String),
        details: expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('email'),
          expect.stringContaining('age'),
        ]),
      });
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/users')
        .send({})
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.any(String),
        details: expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('email'),
        ]),
      });
    });
  });

  describe('GET /users - Query Validation', () => {
    it('should validate and parse valid query parameters', async () => {
      const response = await request(app)
        .get('/users?search=john&limit=50')
        .expect(200);

      expect(response.body.validated).toEqual({
        search: 'john',
        limit: 50,
      });
    });

    it('should handle optional query parameters', async () => {
      const response = await request(app)
        .get('/users?limit=20')
        .expect(200);

      expect(response.body.validated).toEqual({
        limit: 20,
      });
    });

    it('should reject invalid query parameters', async () => {
      const response = await request(app)
        .get('/users?search=a&limit=200')
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.stringContaining('search'),
          expect.stringContaining('limit'),
        ]),
      });
    });
  });

  describe('GET /users/:id/:action - Params Validation', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should validate and parse valid URL parameters', async () => {
      const response = await request(app)
        .get(`/users/${validUUID}/edit`)
        .expect(200);

      expect(response.body.validated).toEqual({
        id: validUUID,
        action: 'edit',
      });
    });

    it('should reject invalid UUID', async () => {
      const response = await request(app)
        .get('/users/123/edit')
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.stringContaining('id'),
        ]),
      });
    });

    it('should reject invalid action', async () => {
      const response = await request(app)
        .get(`/users/${validUUID}/invalid`)
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.stringContaining('action'),
        ]),
      });
    });
  });

  describe('Content Type Handling', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should handle application/json', async () => {
      await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send(validUser)
        .expect(200);
    });

    it('should handle x-www-form-urlencoded', async () => {
      await request(app)
        .post('/users')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(validUser)
        .expect(200);
    });

    it('should reject invalid content type', async () => {
      await request(app)
        .post('/users')
        .set('Content-Type', 'text/plain')
        .send(JSON.stringify(validUser))
        .expect(400);
    });
  });

  describe('Error Details', () => {
    it('should provide detailed validation errors', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'J',
          email: 'invalid',
        })
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.any(String),
        details: expect.arrayContaining([
          expect.stringMatching(/name.*at least 2/i),
          expect.stringMatching(/email.*invalid/i),
        ]),
      });
    });

    it('should handle multiple errors in single field', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: '',
          email: '',
        })
        .expect(400);

      expect(response.body.error.details).toHaveLength(2);
    });
  });

  describe('Type Coercion', () => {
    it('should coerce string numbers in query params', async () => {
      const response = await request(app)
        .get('/users?limit=25')
        .expect(200);

      expect(response.body.validated.limit).toBe(25);
      expect(typeof response.body.validated.limit).toBe('number');
    });

    it('should reject non-coercible values', async () => {
      const response = await request(app)
        .get('/users?limit=invalid')
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.stringContaining('limit'),
        ]),
      });
    });
  });
});