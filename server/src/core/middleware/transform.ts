import { Request, Response, NextFunction } from 'express';
import { SuccessResponse, ErrorResponseBase } from '@core/types/responses';
import { v4 as uuidv4 } from 'uuid';

/**
 * Type guard to check if a response is an error response
 */
const isErrorResponse = (body: unknown): body is ErrorResponseBase => {
  return Boolean(
    body &&
    typeof body === 'object' &&
    'error' in body &&
    typeof (body as ErrorResponseBase).error.code === 'string' &&
    typeof (body as ErrorResponseBase).error.message === 'string'
  );
};

/**
 * Safely parse a pagination parameter to a number
 */
const parsePaginationParam = (value: unknown): number | undefined => {
  if (typeof value !== 'string') return undefined;
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 ? num : undefined;
};

/**
 * Get or create a request ID
 */
const getRequestId = (req: Request): string => {
  return (
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-correlation-id'] as string) ||
    uuidv4()
  );
};

/**
 * Middleware to transform response data into standardized format
 */
export const transformResponse = (req: Request, res: Response, next: NextFunction) => {
  // Store the original res.json function
  const originalJson = res.json.bind(res);
  const requestId = getRequestId(req);

  // Set the request ID in response headers
  res.setHeader('x-request-id', requestId);

  // Override res.json to transform the response
  res.json = function(body: unknown): Response {
    // Handle error responses
    if (isErrorResponse(body)) {
      // Ensure error response has a requestId
      if (!body.error.requestId) {
        body.error.requestId = requestId;
      }
      return originalJson(body);
    }

    // Transform successful responses
    const transformed: SuccessResponse<unknown> = {
      data: body,
      meta: {
        requestId
      }
    };

    // Add pagination metadata if present in query
    const { page, limit, sort, order } = req.query;
    if (page || limit || sort || order) {
      transformed.meta = {
        ...transformed.meta,
        pagination: {
          page: parsePaginationParam(page),
          limit: parsePaginationParam(limit),
          sort: typeof sort === 'string' ? sort : undefined,
          order: typeof order === 'string' && ['asc', 'desc'].includes(order) ? order : undefined
        }
      };
    }

    return originalJson(transformed);
  };

  next();
};

/**
 * Helper function to create a paginated response
 * @param data The array of items to return
 * @param total The total number of items (across all pages)
 * @param page The current page number
 * @param limit The page size limit
 * @param options Additional options (sort, order)
 */
export interface PaginationOptions {
  sort?: string;
  order?: 'asc' | 'desc';
  requestId?: string;
}

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  options: PaginationOptions = {}
): SuccessResponse<T[]> => {
  const { sort, order, requestId = uuidv4() } = options;

  return {
    data,
    meta: {
      requestId,
      pagination: {
        page,
        limit,
        total,
        sort,
        order
      }
    }
  };
};
