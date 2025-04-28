import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../../errors';
import { AuthRequest } from '../../types/auth';

export const requireRoles = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.roles) {
      return next(new AppError(ErrorCode.FORBIDDEN, 'User roles not found'));
    }

    const hasRequiredRole = roles.some(role => authReq.user.roles.includes(role));
    
    if (!hasRequiredRole) {
      return next(new AppError(ErrorCode.FORBIDDEN, 'Insufficient permissions'));
    }

    next();
  };
};