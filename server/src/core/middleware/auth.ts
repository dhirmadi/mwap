import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { User } from '@models/v2/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    // Note: This is a placeholder. Implement your actual role checking logic here
    // based on your user model and role management system
    const userRoles: string[] = []; // Get this from your user object
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  };
};