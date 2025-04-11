import { Response, NextFunction } from 'express';
import { Auth0Request } from './types';

/**
 * Middleware to ensure request is authenticated
 */
export function withAuth() {
  return async (req: Auth0Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };
}