import request from 'supertest';
import { Express } from 'express';
import { RouterAuth } from './router';
import { createTestApp } from '../testing/test-utils';

describe('Route Authentication', () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Authenticated Routes', () => {
    it('should reject unauthenticated requests', async () => {
      const router = RouterAuth.authenticated();
      app.use('/test', router, (req, res) => {
        res.status(200).json({ message: 'Authenticated route' });
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(401);
    });

    it('should allow authenticated requests', async () => {
      const router = RouterAuth.authenticated();
      app.use('/test', router, (req, res) => {
        res.status(200).json({ message: 'Authenticated route' });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${generateValidToken()}`);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Role-Based Routes', () => {
    it('should reject requests without required roles', async () => {
      const router = RouterAuth.withRoles(['ADMIN']);
      app.use('/admin', router, (req, res) => {
        res.status(200).json({ message: 'Admin route' });
      });

      const response = await request(app)
        .get('/admin')
        .set('Authorization', `Bearer ${generateUserToken()}`);
      
      expect(response.status).toBe(403);
    });

    it('should allow requests with required roles', async () => {
      const router = RouterAuth.withRoles(['ADMIN']);
      app.use('/admin', router, (req, res) => {
        res.status(200).json({ message: 'Admin route' });
      });

      const response = await request(app)
        .get('/admin')
        .set('Authorization', `Bearer ${generateAdminToken()}`);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Tenant Owner Routes', () => {
    it('should reject requests for non-owned tenants', async () => {
      const router = RouterAuth.tenantOwner();
      app.use('/tenant/:tenantId', router, (req, res) => {
        res.status(200).json({ message: 'Tenant route' });
      });

      const response = await request(app)
        .get('/tenant/other-tenant-id')
        .set('Authorization', `Bearer ${generateUserToken()}`);
      
      expect(response.status).toBe(403);
    });

    it('should allow requests for owned tenants', async () => {
      const router = RouterAuth.tenantOwner();
      app.use('/tenant/:tenantId', router, (req, res) => {
        res.status(200).json({ message: 'Tenant route' });
      });

      const response = await request(app)
        .get('/tenant/user-tenant-id')
        .set('Authorization', `Bearer ${generateUserToken('user-tenant-id')}`);
      
      expect(response.status).toBe(200);
    });
  });
});

// Utility functions for generating test tokens
function generateValidToken() {
  // Implement a method to generate a valid JWT token
  return 'valid-jwt-token';
}

function generateUserToken(tenantId = 'default-tenant') {
  // Implement a method to generate a user JWT token
  return `user-jwt-token-${tenantId}`;
}

function generateAdminToken() {
  // Implement a method to generate an admin JWT token
  return 'admin-jwt-token';
}