import { Response, NextFunction } from 'express';
import { Role, roleHierarchy, isValidRole } from '@core/middleware/types';
import { AuthRequest } from '@core/types/express';
import { TenantModel } from '@features/tenant/schemas';
import { ProjectModel } from '@features/projects/schemas';

/**
 * Middleware to ensure user doesn't already have a tenant
 */
export function requireNoTenant() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Stub: Check if user already has a tenant
    const hasTenant = false;
    if (hasTenant) {
      res.status(403).json({
        message: 'User already has a tenant'
      });
      return;
    }
    next();
  };
}

/**
 * Middleware to ensure user owns the tenant
 */
export function requireTenantOwner() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: tenantId } = req.params;
    const userId = req.user?.sub;

    // Stub: Check if user owns the tenant
    const isOwner = false;
    if (!isOwner) {
      res.status(403).json({
        message: 'Only tenant owner can perform this action'
      });
      return;
    }
    next();
  };
}

/**
 * Middleware to ensure user has required project role(s)
 * @param requiredRoles Single role or array of roles that can access
 */
export function requireProjectRole(requiredRoles?: Role | Role[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: projectId } = req.params;
    const userId = req.user?.sub;

    // Stub: Get user's role in project
    const userRole = 'contributor';
    if (!isValidRole(userRole)) {
      res.status(403).json({
        message: 'Invalid role'
      });
      return;
    }

    // If specific roles required, check user has one
    if (requiredRoles) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const userRoleLevel = roleHierarchy[userRole];
      const hasRequiredRole = roles.some(role => 
        roleHierarchy[role] <= userRoleLevel
      );

      if (!hasRequiredRole) {
        res.status(403).json({
          message: 'Insufficient permissions for this action'
        });
        return;
      }
    }

    next();
  };
}