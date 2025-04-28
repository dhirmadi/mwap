import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';

export const requireUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.id) {
    return next(new AppError(ErrorCode.UNAUTHORIZED, 'User not authenticated'));
  }

  next();
};