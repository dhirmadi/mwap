import { Request, Response, NextFunction } from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { AuthenticatedUserSchema, SystemRole } from './types';
import { AppError } from '../errors/AppError';

// JWT Verification Configuration
export const jwtCheck = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }) as GetVerificationKey,
  
  // Validate the audience and issuer
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        [key: string]: any;
      };
    }
  }
}

// Authentication Middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) {
    throw AppError.unauthorized('Authentication required');
  }
  next();
}

// Role-based Authorization Middleware
export function requireRoles(roles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw AppError.unauthorized('Authentication required');
    }

    // Validate user schema
    const userValidation = AuthenticatedUserSchema.safeParse({
      sub: req.auth.sub,
      email: req.auth.email || 'unknown@example.com',
      name: req.auth.name || 'Unknown User',
      roles: req.auth.roles || ['USER']
    });

    if (!userValidation.success) {
      throw AppError.forbidden('Invalid user profile');
    }

    const user = userValidation.data;

    // Check if user has any of the required roles
    const hasRequiredRole = roles.some(role => 
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      throw AppError.forbidden(`Requires one of these roles: ${roles.join(', ')}`);
    }

    next();
  };
}

// Tenant Owner Middleware
export function requireTenantOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) {
    throw AppError.unauthorized('Authentication required');
  }

  const tenantId = req.params.tenantId || req.body.tenantId;
  
  if (!tenantId) {
    throw AppError.badRequest('Tenant ID is required');
  }

  // In a real-world scenario, you'd check against the database
  // This is a placeholder for actual tenant ownership verification
  if (req.auth.tenantId !== tenantId) {
    throw AppError.forbidden('Not authorized for this tenant');
  }

  next();
}