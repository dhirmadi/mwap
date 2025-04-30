import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logging-v2';

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown) {
    return new AppError(code, message, 400, details);
  }

  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new AppError(code, message, 401);
  }

  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(code, message, 403);
  }

  /**
   * Create a 404 Not Found error
   */
  static notFound(message = 'Not Found', code = 'NOT_FOUND') {
    return new AppError(code, message, 404);
  }

  /**
   * Create a 409 Conflict error
   */
  static conflict(message: string, code = 'CONFLICT', details?: unknown) {
    return new AppError(code, message, 409, details);
  }

  /**
   * Create a 500 Internal Server Error
   */
  static internal(message = 'Internal Server Error', code = 'INTERNAL_ERROR', details?: unknown) {
    return new AppError(code, message, 500, details);
  }
}

/**
 * Global error handler middleware
 */
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // Log the error
  logger.error('Request error', {
    error: err,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.message,
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }

  // Default to 500 internal server error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
      }),
    },
  });
}