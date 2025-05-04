import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core-v2/errors/AppError';
import { MWAP_ROLES, type MWAPRole } from './roles';
import type { MWAPUser } from '../../types-v2/user';

// Role hierarchy for authorization
const ROLE_HIERARCHY: Record<MWAPRole, number> = {
  [MWAP_ROLES.SUPERADMIN]: 5,
  [MWAP_ROLES.OWNER]: 4,
  [MWAP_ROLES.DEPUTY]: 3,
  [MWAP_ROLES.CONTRIBUTOR]: 2,
  [MWAP_ROLES.MEMBER]: 1
};

/**
 * Middleware to verify project role
 * Requires projectId in request params or body
 */
export const requireProjectRole = (minimumRole: MWAPRole = MWAP_ROLES.MEMBER) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as MWAPUser;
      if (!user) {
        throw AppError.unauthorized('User not found in request');
      }

      // Get projectId from params or body
      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        throw AppError.badRequest('Project ID not found in request');
      }

      // Short circuit for superadmins
      if (user.roles.includes(MWAP_ROLES.SUPERADMIN)) {
        return next();
      }

      // TODO: Fetch project role from database
      const projectRole = await getProjectRole(projectId, user.id);
      
      if (!projectRole) {
        throw AppError.forbidden('No access to this project');
      }

      if (ROLE_HIERARCHY[projectRole] < ROLE_HIERARCHY[minimumRole]) {
        throw AppError.forbidden('Insufficient project permissions');
      }

      // Add project role to request for downstream use
      req.projectRole = projectRole;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Convenience exports for common role requirements
export const requireProjectOwner = () => requireProjectRole(MWAP_ROLES.OWNER);
export const requireProjectDeputy = () => requireProjectRole(MWAP_ROLES.DEPUTY);
export const requireProjectContributor = () => requireProjectRole(MWAP_ROLES.CONTRIBUTOR);
export const requireProjectMember = () => requireProjectRole(MWAP_ROLES.MEMBER);

// Placeholder for project role lookup
// TODO: Implement actual database query
async function getProjectRole(projectId: string, userId: string): Promise<MWAPRole | null> {
  // This should query your database to get the user's role for the specific project
  throw new Error('getProjectRole not implemented');
}