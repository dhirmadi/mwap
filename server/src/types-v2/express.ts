import type { Request, Response, NextFunction } from 'express';
import type { AuthUser } from './auth';
import type { LogLevel, LogContext } from '../logging-v2';

/**
 * Extended Express request with auth user and logging
 */
export interface AuthenticatedRequest extends Request {
  /** Authenticated user */
  user: AuthUser;
  
  /** Request-scoped logger */
  log(level: LogLevel, message: string, context?: LogContext): void;
}

/**
 * Type-safe Express request handler
 */
export type ExpressHandler<
  P = unknown, // Path parameters
  ResBody = unknown, // Response body
  ReqBody = unknown, // Request body
  ReqQuery = unknown, // Query parameters
  Locals extends Record<string, unknown> = Record<string, unknown> // Response locals
> = (
  req: AuthenticatedRequest & {
    params: P;
    body: ReqBody;
    query: ReqQuery;
  },
  res: Response<ResBody, Locals>,
  next: NextFunction
) => Promise<void> | void;

/**
 * Express middleware type
 */
export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

/**
 * Success response wrapper
 */
export interface SuccessResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

/**
 * Error response wrapper
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}