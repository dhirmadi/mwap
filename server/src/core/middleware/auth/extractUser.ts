import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';
import { AuthRequest } from '@core/types/express';
import { User } from '@core/types/auth';

export const extractUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as any;
    const payload = authReq.auth?.payload;

    if (!payload) {
      return next(new AppError('No auth payload found', 401));
    }

    const user: User = {
      id: payload.sub,
      sub: payload.sub,
      email: payload.email ?? '',
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      tenantId: payload.tenantId,
    };

    (req as AuthRequest).user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
