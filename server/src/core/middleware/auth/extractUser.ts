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
    return next(new AppError(ErrorCode.UNAUTHORIZED, 'No auth payload found'));
  }

  const { sub: id, email } = authReq.auth.payload;
  
  if (!id || !email) {
    return next(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid auth payload'));
  }

  req.user = { id, email };
  next();
};