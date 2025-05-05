import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import type { MWAPUser } from '../../types-v2/user';
export { 
  UserIdentity, 
  assertValidUserId, 
  userIdentityConfig 
} from './userIdentity';

/**
 * Basic authentication middleware
 * Verifies that a user exists in the request
 */
export const requireAuth = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as MWAPUser;
      if (!user) {
        throw AppError.unauthorized('Authentication required');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Extracts user from request
 * Returns null if no user found
 */
export const getUser = (req: Request): MWAPUser | null => {
  return (req.user as MWAPUser) || null;
};

/**
 * Extracts user from request
 * Throws if no user found
 */
export const getUserOrThrow = (req: Request): MWAPUser => {
  const user = getUser(req);
  if (!user) {
    throw AppError.unauthorized('User not found in request');
  }
  return user;
};