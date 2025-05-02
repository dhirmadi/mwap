import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../core-v2/errors';

/**
 * Extends Express Request with validated data
 */
export interface RequestWithValidated extends Request {
  validated: {
    body?: Record<string, any>;
    query?: Record<string, any>;
    params?: Record<string, any>;
  };
}

/**
 * Type of request data source to validate
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Schema for full request validation
 */
export type RequestValidationSchema = z.ZodObject<{
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}>;

/**
 * Creates a middleware that validates request data using a Zod schema
 * @param schema Zod schema to validate against
 * @param target Request property to validate ('body', 'query', or 'params')
 * 
 * @example
 * ```typescript
 * const createUserSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email()
 * });
 * 
 * router.post('/users',
 *   validateRequest(createUserSchema, 'body'),
 *   controller.createUser
 * );
 * ```
 */
export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  target: ValidationTarget = 'body'
) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Initialize validated data container if not exists
      if (!(req as RequestWithValidated).validated) {
        (req as RequestWithValidated).validated = {};
      }

      // Validate and parse the data
      const data = await schema.parseAsync(req[target]);

      // Attach parsed data to request
      (req as RequestWithValidated).validated[target] = data;

      next();
    } catch (error) {
      // Convert Zod validation errors to AppError
      if (error instanceof z.ZodError) {
        next(AppError.fromZodError(error));
        return;
      }
      // Pass through other errors
      next(error);
    }
  };
}

/**
 * Creates a validation middleware for multiple request targets
 * 
 * @param schema - Object containing Zod schemas for body, query, and/or params
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const schema = {
 *   body: z.object({
 *     name: z.string()
 *   }),
 *   params: z.object({
 *     id: z.string().uuid()
 *   })
 * };
 * 
 * router.patch('/users/:id',
 *   validateRequestSchema(schema),
 *   controller.updateUser
 * );
 * ```
 */
export function validateRequestSchema(schema: RequestValidationSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Initialize validated data container
      (req as RequestWithValidated).validated = {};

      // Validate each target if schema provided
      if (schema.shape.body) {
        (req as RequestWithValidated).validated.body = await schema.shape.body.parseAsync(req.body);
      }
      if (schema.shape.query) {
        (req as RequestWithValidated).validated.query = await schema.shape.query.parseAsync(req.query);
      }
      if (schema.shape.params) {
        (req as RequestWithValidated).validated.params = await schema.shape.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(AppError.fromZodError(error));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Helper to create a request validation schema
 * 
 * @param config - Object containing Zod schemas for body, query, and/or params
 * @returns Zod schema for request validation
 * 
 * @example
 * ```typescript
 * const schema = createRequestSchema({
 *   body: z.object({
 *     name: z.string()
 *   }),
 *   query: z.object({
 *     filter: z.string().optional()
 *   })
 * });
 * ```
 */
export function createRequestSchema(config: {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}): RequestValidationSchema {
  return z.object({
    ...(config.body && { body: config.body }),
    ...(config.query && { query: config.query }),
    ...(config.params && { params: config.params })
  });
}

// Export type helpers
export type ValidatedRequest<T extends RequestValidationSchema> = Request & {
  validated: {
    body?: z.infer<T['shape']['body']>;
    query?: z.infer<T['shape']['query']>;
    params?: z.infer<T['shape']['params']>;
  };
};