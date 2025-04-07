import { Response, NextFunction } from 'express';
import { UserRole } from '../models';
import { AppError } from '../utils/errors';
import { TenantRequest, ROLE_HIERARCHY } from './types';

/**
 * Middleware factory to enforce minimum role requirements
 */
export const requireTenantRole = (requiredRole: UserRole) => {
  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure tenant context is available
      if (!req.tenant || !req.userTenantRole) {
        throw new AppError('Tenant context not available. Did you forget to use injectTenantContext?', 500);
      }

      const userRoleLevel = ROLE_HIERARCHY[req.userTenantRole];
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];

      if (!userRoleLevel || !requiredRoleLevel) {
        throw new AppError('Invalid role configuration', 500);
      }

      if (userRoleLevel < requiredRoleLevel) {
        throw new AppError(
          `This action requires ${requiredRole} privileges or higher`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};