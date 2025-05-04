import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core-v2/errors';
import { logger } from '../../core-v2/logger';

export interface MWAPUser {
  id: string;
  email: string;
  roles: string[];
  tenantId?: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: MWAPUser;
    }
  }
}

/**
 * Extract user from request
 */
export function extractUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 'AUTH_NO_TOKEN', 401);
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    // TODO: Implement JWT verification with Auth0
    const user: MWAPUser = {
      id: '123',
      email: 'test@example.com',
      roles: ['user'],
      isAdmin: false
    };

    req.user = user;
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
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 'AUTH_NO_USER', 401);
      }

      const hasRole = roles.some(role => req.user!.roles.includes(role));
      if (!hasRole) {
        throw new AppError('Insufficient permissions', 'AUTH_FORBIDDEN', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require super admin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 'AUTH_NO_USER', 401);
    }

    if (!req.user.isAdmin) {
      throw new AppError('Super admin access required', 'AUTH_FORBIDDEN', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require tenant owner role
 */
export function requireTenantOwner(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 'AUTH_NO_USER', 401);
    }

    if (!req.user.tenantId) {
      throw new AppError('No tenant associated', 'AUTH_NO_TENANT', 403);
    }

    // TODO: Verify tenant ownership
    next();
  } catch (error) {
    next(error);
  }
}