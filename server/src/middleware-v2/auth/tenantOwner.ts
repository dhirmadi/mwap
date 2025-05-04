import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core-v2/errors/AppError';
import { MWAP_ROLES } from './roles';
import type { MWAPUser } from '../../types-v2/user';

/**
 * Middleware to require tenant owner role
 * Requires tenantId in request params or body
 */
export const requireTenantOwner = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as MWAPUser;
      if (!user) {
        throw AppError.unauthorized('User not found in request');
      }

      // Get tenantId from params or body
      const tenantId = req.params.tenantId || req.body.tenantId;
      if (!tenantId) {
        throw AppError.badRequest('Tenant ID not found in request');
      }

      // Short circuit for superadmins
      if (user.roles.includes(MWAP_ROLES.SUPERADMIN)) {
        return next();
      }

      // TODO: Fetch tenant role from database
      const tenantRole = await getTenantRole(tenantId, user.id);
      
      if (!tenantRole || tenantRole !== MWAP_ROLES.OWNER) {
        throw AppError.forbidden('Tenant owner access required');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Placeholder for tenant role lookup
// TODO: Implement actual database query
async function getTenantRole(tenantId: string, userId: string): Promise<string | null> {
  // This should query your database to get the user's role for the specific tenant
  throw new Error('getTenantRole not implemented');
}