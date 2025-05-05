import "@jest/globals";
import express, { Request, Response } from 'express';
import request from 'supertest';
import { AppError } from '../../../core-v2/errors';
import { requireRoles, requireSuperAdmin, verifyProjectRole, MWAP_ROLES } from '../roles';
import type { MWAPUser } from '../extractUser';

describe('Role-Based Access Control Middleware', () => {
  let app: express.Application;

  // Helper to create a test route with middleware
  const createTestRoute = (middleware: express.RequestHandler) => {
    app = express();

    // Error handling middleware
    app.use((err: AppError, req: Request, res: Response, next: express.NextFunction) => {
      res.status(err.statusCode || 500).json({
        error: {
          message: err.message,
          code: err.code,
        },
      });
    });

    // Test route with middleware
    app.get('/test', middleware, (req, res) => {
      res.json({ success: true });
    });

    return app;
  };

  describe('requireRoles', () => {
    it('should allow access with matching role', async () => {
      const app = createTestRoute(requireRoles(MWAP_ROLES.OWNER));

      // Mock user with OWNER role
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.OWNER],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should allow access with any matching role', async () => {
      const app = createTestRoute(requireRoles(MWAP_ROLES.OWNER, MWAP_ROLES.DEPUTY));

      // Mock user with DEPUTY role
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.DEPUTY],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should deny access with non-matching role', async () => {
      const app = createTestRoute(requireRoles(MWAP_ROLES.OWNER));

      // Mock user with MEMBER role
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.MEMBER],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
      expect(response.body.error).toEqual({
        message: 'Insufficient permissions',
        code: 'AUTH_INSUFFICIENT_ROLE',
      });
    });

    it('should deny access with missing user', async () => {
      const app = createTestRoute(requireRoles(MWAP_ROLES.OWNER));

      const response = await request(app).get('/test');
      expect(response.status).toBe(401);
      expect(response.body.error).toEqual({
        message: expect.stringContaining('User not found'),
        code: 'AUTH_NO_USER',
      });
    });

    it('should deny access with empty roles array', async () => {
      const app = createTestRoute(requireRoles(MWAP_ROLES.OWNER));

      // Mock user with no roles
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
      expect(response.body.error).toEqual({
        message: 'Insufficient permissions',
        code: 'AUTH_INSUFFICIENT_ROLE',
      });
    });
  });

  describe('requireSuperAdmin', () => {
    it('should allow access for superadmin', async () => {
      const app = createTestRoute(requireSuperAdmin());

      // Mock superadmin user
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'admin@example.com',
          roles: [MWAP_ROLES.SUPERADMIN],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should deny access for non-superadmin', async () => {
      const app = createTestRoute(requireSuperAdmin());

      // Mock regular user
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.OWNER],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
      expect(response.body.error).toEqual({
        message: 'Superadmin access required',
        code: 'AUTH_NOT_SUPERADMIN',
      });
    });
  });

  describe('verifyProjectRole', () => {
    // Mock project role lookup
    const mockGetProjectRole = jest.fn();
    jest.mock('../roles', () => ({
      ...jest.requireActual('../roles'),
      getProjectRole: mockGetProjectRole,
    }));

    beforeEach(() => {
      mockGetProjectRole.mockClear();
    });

    it('should allow access with sufficient project role', async () => {
      const app = createTestRoute(verifyProjectRole(MWAP_ROLES.MEMBER));

      // Mock user and project role
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.MEMBER],
        } as MWAPUser;
        req.params.projectId = 'project-123';
        mockGetProjectRole.mockResolvedValueOnce(MWAP_ROLES.OWNER);
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should deny access with insufficient project role', async () => {
      const app = createTestRoute(verifyProjectRole(MWAP_ROLES.OWNER));

      // Mock user and project role
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.MEMBER],
        } as MWAPUser;
        req.params.projectId = 'project-123';
        mockGetProjectRole.mockResolvedValueOnce(MWAP_ROLES.MEMBER);
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
      expect(response.body.error).toEqual({
        message: 'Insufficient project permissions',
        code: 'PROJECT_INSUFFICIENT_ROLE',
      });
    });

    it('should allow superadmin access regardless of project role', async () => {
      const app = createTestRoute(verifyProjectRole(MWAP_ROLES.OWNER));

      // Mock superadmin user
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'admin@example.com',
          roles: [MWAP_ROLES.SUPERADMIN],
        } as MWAPUser;
        req.params.projectId = 'project-123';
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should handle missing projectId', async () => {
      const app = createTestRoute(verifyProjectRole());

      // Mock user without projectId
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.MEMBER],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Project ID not found in request',
        code: 'PROJECT_ID_MISSING',
      });
    });

    it('should handle project not found', async () => {
      const app = createTestRoute(verifyProjectRole());

      // Mock user and non-existent project
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.MEMBER],
        } as MWAPUser;
        req.params.projectId = 'project-123';
        mockGetProjectRole.mockResolvedValueOnce(null);
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
      expect(response.body.error).toEqual({
        message: 'No access to this project',
        code: 'PROJECT_NO_ACCESS',
      });
    });
  });

  describe('Role Hierarchy', () => {
    it('should allow higher roles to access lower role requirements', async () => {
      const app = createTestRoute(requireRoles(MWAP_ROLES.MEMBER));

      // Mock user with OWNER role
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.OWNER],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should handle multiple roles correctly', async () => {
      const app = createTestRoute(requireRoles(MWAP_ROLES.OWNER));

      // Mock user with multiple roles
      app.use((req, res, next) => {
        req.user = {
          sub: 'user|123',
          email: 'test@example.com',
          roles: [MWAP_ROLES.MEMBER, MWAP_ROLES.DEPUTY, MWAP_ROLES.OWNER],
        } as MWAPUser;
        next();
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });
  });
});