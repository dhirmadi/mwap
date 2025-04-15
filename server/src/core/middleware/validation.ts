import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { ValidationErrorResponse, OrderDirection } from '@core/types/responses';
import { v4 as uuidv4 } from 'uuid';

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
 * Base pagination query schema without refinements
 */
export const paginationQueryBaseSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc'] as const).optional()
});

/**
 * Middleware that validates pagination parameters
 */
export const validatePagination = validateRequest(paginationQueryBaseSchema, 'query');

/**
 * Full pagination validation with refinements
 */
export const validatePaginationRefined = (data: unknown) => {
  return paginationQueryBaseSchema
    .refine(
      data => {
        const page = data.page as number | undefined;
        const limit = data.limit as number | undefined;
        if (page !== undefined && page < 1) return false;
        if (limit !== undefined && (limit < 1 || limit > 100)) return false;
        return true;
      },
      {
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
      }
    )
    .parse(data);
};