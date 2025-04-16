import { Request, Response, NextFunction } from 'express';
import { User } from '@core/types/auth';

// 1. Global type extension
declare global {
  namespace Express {
    interface Request {
      user: User;
      id: string;
    }
  }
}

// 2. Keep AuthRequest for backwards compatibility
export interface AuthRequest extends Request {
  user: User;
  id: string;
}

// 3. Update handler types to use standard Request
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type AsyncController = {
  [key: string]: AsyncRequestHandler;
};

// 4. Router handler types
export type RouterHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// 4. Type guard for authenticated requests
export function isAuthenticatedRequest(
  req: Request
): req is Request & { user: User } {
  return 'user' in req && req.user !== undefined;
}