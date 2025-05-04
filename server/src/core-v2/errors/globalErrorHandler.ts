import type { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { logger } from '../../logging-v2';

/**
 * Global error handler middleware with structured logging
 */
export function globalErrorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction // Required by Express even if unused
): void {
  // Get request context for logging
  const context = {
    requestId: req.headers['x-request-id'] as string,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    path: req.path,
    method: req.method,
  };

  if (error instanceof AppError) {
    // Log AppError with structured details
    logger.error(error.message, {
      ...context,
      error: {
        name: error.name,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });

    // Send structured error response
    res.status(error.statusCode).json(error.toJSON());
  } else {
    // Log unknown error with full stack trace
    logger.error('Unhandled error', {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });

    // Send generic error response
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          originalError: {
            message: error.message,
            stack: error.stack,
          },
        }),
      },
    });
  }
}