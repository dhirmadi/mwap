import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { AppError } from '@core/errors';

/**
 * Middleware for validating request payloads against a Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const validationError = error as { errors: { message: string }[] };

      const message =
        'Invalid request data: ' +
        validationError.errors.map((e) => e.message).join(', ');

      return next(new AppError(message, 400));
    }
  };
};
