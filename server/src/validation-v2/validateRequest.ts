import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../core-v2/errors';

/**
 * Extends Express Request with validated data
 */
export interface RequestWithValidated<T = unknown> extends Request {
  validated: T;
}

/**
 * Type of request data source to validate
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates a middleware that validates request data using a Zod schema
 * @param schema Zod schema to validate against
 * @param target Request property to validate ('body', 'query', or 'params')
 */
export function validateRequest<T extends AnyZodObject>(
  schema: T,
  target: ValidationTarget = 'body'
) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate and parse the data
      const data = await schema.parseAsync(req[target]);

      // Attach parsed data to request
      (req as RequestWithValidated<T['_output']>).validated = data;

      next();
    } catch (error) {
      // Convert Zod validation errors to AppError
      if (error instanceof ZodError) {
        next(AppError.fromZodError(error));
        return;
      }
      // Pass through other errors
      next(error);
    }
  };
}