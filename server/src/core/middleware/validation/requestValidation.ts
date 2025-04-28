import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { AppError, ErrorCode } from '@core/errors';

export const validateRequest = (schema: AnyZodObject) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      next(new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid request data: ' + error.errors.map(e => e.message).join(', ')
      ));
    }
  };
};