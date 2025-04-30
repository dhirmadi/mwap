import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../core-v2/errors';

// Re-export all schemas and types
export * from './schemas';
export * from './validateRequest';

/**
 * Type-safe request validation options
 */
export interface ValidationOptions {
  /**
   * Where to look for data to validate
   * @default 'body'
   */
  source?: 'body' | 'query' | 'params';

  /**
   * Whether to strip unknown properties from the validated data
   * @default true
   */
  strip?: boolean;

  /**
   * Whether to attach validated data to req.validated
   * @default false
   */
  attachToValidated?: boolean;
}

/**
 * Creates middleware that validates request data against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 * 
 * @example
 * ```ts
 * router.post('/tenants',
 *   validate(createTenantSchema),
 *   createTenantHandler
 * );
 * ```
 */
export const validate = <T extends z.ZodType>(
  schema: T,
  options: ValidationOptions = {}
) => {
  const {
    source = 'body',
    strip = true,
    attachToValidated = false,
  } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get data from the specified source
      const data = req[source];

      // Create a new schema with/without stripping
      const validationSchema = strip
        ? schema.strict()
        : schema;

      // Validate and transform the data
      const validated = await validationSchema.parseAsync(data);

      if (attachToValidated) {
        // Attach to req.validated if requested
        (req as RequestWithValidated<z.infer<T>>).validated = validated;
      } else {
        // Replace the request data with the validated version
        req[source] = validated;
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
};

/**
 * Type helper to extract the inferred type from a validation middleware
 */
export type ValidatedRequest<T extends z.ZodType> = Request & {
  body: z.infer<T>;
};