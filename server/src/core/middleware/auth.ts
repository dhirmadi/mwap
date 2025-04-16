import { Request, Response, NextFunction } from 'express';
import { auth as auth0 } from 'express-oauth2-jwt-bearer';
import { env } from '@core/config/environment';
import { AuthenticationError, AuthorizationError } from '../errors';
import { TenantService } from '@features/tenant/services';
import { AuthMiddleware, AsyncHandler } from '../types/middleware';
import { AuthRequest } from '../types/auth';

// Validate Auth0 configuration
if (!env.auth0.domain || !env.auth0.audience) {
  throw new Error('Auth0 configuration is missing. Please check environment variables.');
}

// Auth0 configuration
const authConfig = {
  audience: env.auth0.audience,
  issuer: `https://${env.auth0.domain}/`,
  jwksUri: `https://${env.auth0.domain}/.well-known/jwks.json`,
  tokenSigningAlg: 'RS256'
};

// JWT validation middleware
const validateToken = auth0(authConfig);

// Role validation middleware
const requireRoles = (roles: string[]): AsyncHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const user = authReq.user;
      
      if (!user) {
        throw new AuthenticationError('User not authenticated');
      }

      const hasRequiredRole = roles.some(role => user.roles.includes(role));
      
      if (!hasRequiredRole) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Tenant role validation middleware
const validateTenantRole = (requiredRole: string): AsyncHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const user = authReq.user;
      const tenantId = req.params.id || req.body.tenantId;
      
      if (!user) {
        throw new AuthenticationError('User not authenticated');
      }

      if (!tenantId) {
        throw new AuthorizationError('Tenant ID not provided');
      }

      // Super admin bypass
      if (user.roles.includes('SUPER_ADMIN')) {
        return next();
      }

      // Get tenant and check membership
      const tenantService = new TenantService();
      const tenant = await tenantService.getTenantById(tenantId);

      const member = tenant.members.find(m => m.userId === user.sub);
      if (!member) {
        throw new AuthorizationError('Not a member of this tenant');
      }

      // Check role
      if (member.role.toLowerCase() !== requiredRole.toLowerCase()) {
        throw new AuthorizationError(`Role ${requiredRole} required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Combined auth middleware for common use cases
export const auth: AuthMiddleware = {
  // Basic token validation
  validateToken,

  // Role-based access control
  requireRoles,

  // Common role combinations
  requireAdmin: [validateToken, requireRoles(['ADMIN', 'SUPER_ADMIN'])],
  requireSuperAdmin: [validateToken, requireRoles(['SUPER_ADMIN'])],

  // Tenant role combinations
  requireTenantAdmin: [
    validateToken,
    validateTenantRole('admin')
  ],
  requireTenantMember: [
    validateToken,
    validateTenantRole('member')
  ],
  requireTenantOwner: [
    validateToken,
    validateTenantRole('owner')
  ]
};