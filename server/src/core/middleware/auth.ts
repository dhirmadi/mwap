import { Request, Response, NextFunction } from 'express';
import { auth as auth0 } from 'express-oauth2-jwt-bearer';
import { env } from '@core/config/environment';
import { AuthenticationError, AuthorizationError } from '../types/errors';
import { User, TenantRole } from '../types';

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
const requireRoles = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
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

// Tenant access validation middleware
const validateTenantAccess = (requiredRole?: TenantRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const tenantId = req.params.tenantId || req.body.tenantId;
      
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

      // Check tenant membership
      if (user.tenantId !== tenantId) {
        throw new AuthorizationError('No access to this tenant');
      }

      // Check role if required
      if (requiredRole && !user.roles.includes(requiredRole)) {
        throw new AuthorizationError(`Role ${requiredRole} required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Combined auth middleware for common use cases
export const auth = {
  // Basic token validation
  validateToken,

  // Role-based access control
  requireRoles,

  // Tenant access control
  validateTenantAccess,

  // Common role combinations
  requireAdmin: requireRoles(['ADMIN', 'SUPER_ADMIN']),
  requireSuperAdmin: requireRoles(['SUPER_ADMIN']),

  // Tenant role combinations
  requireTenantAdmin: [
    validateToken,
    validateTenantAccess(TenantRole.ADMIN)
  ],
  requireTenantMember: [
    validateToken,
    validateTenantAccess(TenantRole.MEMBER)
  ],
  requireTenantOwner: [
    validateToken,
    validateTenantAccess(TenantRole.OWNER)
  ]
};