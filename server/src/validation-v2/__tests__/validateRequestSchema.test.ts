import "@jest/globals";
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validateRequestSchema, createRequestSchema } from '../validateRequest';
import { globalErrorHandler, ValidationError } from '../../core-v2/errors';

describe('validateRequestSchema Integration', () => {
  const app = express();
  app.use(express.json());

  // Test schema for a project update endpoint
  const updateProjectSchema = createRequestSchema({
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      status: z.enum(['active', 'archived']).optional(),
    }),
    params: z.object({
      id: z.string().uuid(),
      action: z.enum(['update', 'archive', 'restore']),
    }),
    query: z.object({
      version: z.string().optional(),
      dryRun: z.enum(['true', 'false']).optional(),
    }),
  });

  // Test route
  app.patch(
    '/projects/:id/:action',
    validateRequestSchema(updateProjectSchema),
    (req, res) => res.json({
      body: req.validated.body,
      params: req.validated.params,
      query: req.validated.query,
    })
  );

  // Error handler
  app.use(globalErrorHandler);

  describe('PATCH /projects/:id/:action - Full Schema Validation', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should validate all request parts successfully', async () => {
      const response = await request(app)
        .patch(`/projects/${validUUID}/update`)
        .query({ version: '1.0', dryRun: 'true' })
        .send({
          name: 'Updated Project',
          description: 'New description',
          status: 'active',
        })
        .expect(200);

      expect(response.body).toEqual({
        body: {
          name: 'Updated Project',
          description: 'New description',
          status: 'active',
        },
        params: {
          id: validUUID,
          action: 'update',
        },
        query: {
          version: '1.0',
          dryRun: 'true',
        },
      });
    });

    it('should handle partial updates with optional fields', async () => {
      const response = await request(app)
        .patch(`/projects/${validUUID}/update`)
        .send({
          name: 'Updated Project',
        })
        .expect(200);

      expect(response.body).toEqual({
        body: {
          name: 'Updated Project',
        },
        params: {
          id: validUUID,
          action: 'update',
        },
        query: {},
      });
    });

    it('should validate all parts and return combined errors', async () => {
      const response = await request(app)
        .patch('/projects/invalid-uuid/invalid-action')
        .query({ dryRun: 'invalid' })
        .send({
          name: 'A', // too short
          status: 'invalid-status', // invalid enum
        })
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('status'),
          expect.stringContaining('id'),
          expect.stringContaining('action'),
          expect.stringContaining('dryRun'),
        ]),
      });
    });
  });

  describe('Schema Creation and Composition', () => {
    it('should create schema with all parts', () => {
      const schema = createRequestSchema({
        body: z.object({ field: z.string() }),
        query: z.object({ filter: z.string() }),
        params: z.object({ id: z.string() }),
      });

      expect(schema.shape).toHaveProperty('body');
      expect(schema.shape).toHaveProperty('query');
      expect(schema.shape).toHaveProperty('params');
    });

    it('should create schema with optional parts', () => {
      const schema = createRequestSchema({
        body: z.object({ field: z.string() }),
      });

      expect(schema.shape).toHaveProperty('body');
      expect(schema.shape).not.toHaveProperty('query');
      expect(schema.shape).not.toHaveProperty('params');
    });
  });

  describe('Edge Cases', () => {
    const edgeCaseSchema = createRequestSchema({
      body: z.object({
        arrayField: z.array(z.string()).optional(),
        nestedField: z.object({
          key: z.string(),
        }).optional(),
      }),
      query: z.object({
        filters: z.array(z.string()).optional(),
      }).optional(),
    });

    app.post(
      '/edge-cases',
      validateRequestSchema(edgeCaseSchema),
      (req, res) => res.json({
        body: req.validated.body,
        query: req.validated.query,
      })
    );

    it('should handle arrays in body', async () => {
      const response = await request(app)
        .post('/edge-cases')
        .send({
          arrayField: ['one', 'two'],
          nestedField: {
            key: 'value',
          },
        })
        .expect(200);

      expect(response.body.body).toEqual({
        arrayField: ['one', 'two'],
        nestedField: {
          key: 'value',
        },
      });
    });

    it('should handle array query parameters', async () => {
      const response = await request(app)
        .post('/edge-cases')
        .query({ filters: ['active', 'featured'] })
        .send({})
        .expect(200);

      expect(response.body.query).toEqual({
        filters: ['active', 'featured'],
      });
    });

    it('should handle empty objects', async () => {
      const response = await request(app)
        .post('/edge-cases')
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        body: {},
        query: {},
      });
    });
  });
});