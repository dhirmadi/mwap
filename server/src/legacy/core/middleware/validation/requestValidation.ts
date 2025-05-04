/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { AppError } from '@core/errors';

/**
 * Middleware for validating request payloads against a Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
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
