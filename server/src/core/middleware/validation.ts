import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationErrorResponse } from '@core/types/responses';
import { v4 as uuidv4 } from 'uuid';
import { paginationQuerySchema } from '@core/validation/schemas';

/**
 * Creates a middleware function that validates request data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param target The part of the request to validate ('body' | 'query' | 'params')
 */
export const validateRequest = (schema: AnyZodObject, target: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req[target]);
      // Replace the request data with the validated data
      req[target] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationResponse: ValidationErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            requestId: uuidv4(),
            data: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        };
        res.status(400).json(validationResponse);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware that validates pagination parameters
 */
export const validatePagination = validateRequest(
  paginationQuerySchema,
  'query'
);