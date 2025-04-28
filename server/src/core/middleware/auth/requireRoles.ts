import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { AuthRequest } from '../../types/auth';

export const requireRoles = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.roles) {
      return next(new AppError('User roles not found', 403));
    }

    const hasRequiredRole = roles.some(role => authReq.user.roles.includes(role));
    
    if (!hasRequiredRole) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};