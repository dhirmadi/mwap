import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core-v2/errors';
import type { MWAPUser } from './extractUser';

// Define valid roles as a const for type safety
export const MWAP_ROLES = {
  OWNER: 'OWNER',
  DEPUTY: 'DEPUTY',
  MEMBER: 'MEMBER',
  SUPERADMIN: 'SUPERADMIN',
} as const;

export type MWAPRole = typeof MWAP_ROLES[keyof typeof MWAP_ROLES];

// Helper to verify user exists in request
const verifyUser = (req: Request): MWAPUser => {
  if (!req.user) {
    throw new AppError(
      'User not found in request. Did you forget to use extractUser middleware?',
      'AUTH_NO_USER',
      401
    );
  }
  return req.user;
};

/**
 * Middleware to require one or more roles
 * Usage: requireRoles(MWAP_ROLES.OWNER, MWAP_ROLES.DEPUTY)
 */
export const requireRoles = (...roles: MWAPRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = verifyUser(req);
      
      const hasRequiredRole = roles.some(role => user.roles.includes(role));
      
      if (!hasRequiredRole) {
        throw new AppError(
          'Insufficient permissions',
          'AUTH_INSUFFICIENT_ROLE',
          403
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require superadmin role
 */
export const requireSuperAdmin = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = verifyUser(req);
      
      if (!user.roles.includes(MWAP_ROLES.SUPERADMIN)) {
        throw new AppError(
          'Superadmin access required',
          'AUTH_NOT_SUPERADMIN',
          403
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to verify project role
 * Requires projectId in request params or body
 */
export const verifyProjectRole = (minimumRole: MWAPRole = MWAP_ROLES.MEMBER) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = verifyUser(req);
      
      // Get projectId from params or body
      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        throw new AppError(
          'Project ID not found in request',
          'PROJECT_ID_MISSING',
          400
        );
      }

      // Short circuit for superadmins - they have access to all projects
      if (user.roles.includes(MWAP_ROLES.SUPERADMIN)) {
        return next();
      }

      // Role hierarchy for authorization
      const roleHierarchy: Record<MWAPRole, number> = {
        [MWAP_ROLES.OWNER]: 3,
        [MWAP_ROLES.DEPUTY]: 2,
        [MWAP_ROLES.MEMBER]: 1,
        [MWAP_ROLES.SUPERADMIN]: 4, // Highest level, though checked separately above
      };

      // TODO: Fetch project role from database
      // This is a placeholder - implement actual project role lookup
      const projectRole = await getProjectRole(projectId, user.sub);
      
      if (!projectRole) {
        throw new AppError(
          'No access to this project',
          'PROJECT_NO_ACCESS',
          403
        );
      }

      if (roleHierarchy[projectRole] < roleHierarchy[minimumRole]) {
        throw new AppError(
          'Insufficient project permissions',
          'PROJECT_INSUFFICIENT_ROLE',
          403
        );
      }

      // Add project role to request for downstream use
      req.projectRole = projectRole;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Placeholder for project role lookup
// TODO: Implement actual database query
async function getProjectRole(projectId: string, userId: string): Promise<MWAPRole | null> {
  // This should query your database to get the user's role for the specific project
  throw new Error('getProjectRole not implemented');
}