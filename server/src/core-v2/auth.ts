import type { Request, Response, NextFunction } from 'express';
import type { AuthUser } from '../types-v2';
import { AppError } from './errors';
import { logger } from '../logging-v2';

/**
 * Extract and validate user from request
 */
export function extractUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Auth0
    const user = req.user as AuthUser | undefined;
    
    if (!user?.sub) {
      throw AppError.unauthorized('Missing or invalid user');
    }

    // Validate required fields
    if (!user.email) {
      throw AppError.unauthorized('Missing user email');
    }

    if (!Array.isArray(user.roles)) {
      user.roles = [];
    }

    // Log user context
    logger.debug('User context', {
      userId: user.sub,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    });

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require specific roles
 */
export function requireRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;

    if (!user?.roles?.some(role => roles.includes(role))) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  };
}

/**
 * Require tenant context
 */
export function requireTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as AuthUser;

  if (!user?.tenantId) {
    throw AppError.forbidden('Tenant context required');
  }

  next();
}