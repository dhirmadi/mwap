import { Response, NextFunction } from 'express';
import { Auth0Request } from './types';
import { SuperAdminModel } from '../features/superadmin/schema';

/**
 * Middleware to ensure user is a super admin
 */
export function requireSuperAdmin() {
  return async (req: Auth0Request, res: Response, next: NextFunction) => {
    const userId = req.user?.sub;

    // Stub: Check if user is a super admin
    const isSuperAdmin = false;
    if (!isSuperAdmin) {
      return res.status(403).json({
        message: 'Super admin access required'
      });
    }
    next();
  };
}