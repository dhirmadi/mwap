import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/auth';
import { AppError, ErrorCode } from '@core/errors';

export const extractUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  
  if (!authReq.auth?.payload) {
    return next(new AppError('No auth payload found', 401));
  }

  const { sub: id, email } = authReq.auth.payload;
  
  if (!id || !email) {
    return next(new AppError('Invalid auth payload', 401));
  }

  req.user = { id, email };
  next();
};