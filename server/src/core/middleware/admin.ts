import { Response, NextFunction } from 'express';
import { AuthRequest } from '@core/types/express';
import { SuperAdminModel } from '@features/superadmin/schemas';

/**
 * Middleware to ensure user is a super admin
 */
export function requireSuperAdmin() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.sub;

    // Stub: Check if user is super admin
    const isSuperAdmin = false;
    if (!isSuperAdmin) {
      return res.status(403).json({
        message: 'Only super admins can perform this action'
      });
    }
    next();
  };
}