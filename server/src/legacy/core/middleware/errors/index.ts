/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@core/errors';
import { logger } from '@core/utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, { code: err.code, stack: err.stack });
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
    return;
  }

  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error'
    }
  });
};

export const transformApiError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  // Handle Auth0 errors
  if (error.error === 'invalid_token') {
    return new AppError('Invalid token',ErrorCode.UNAUTHORIZED);
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return new AppError('Validation Error', 400, error.message);
  }

  // Handle database errors
  if (error.name === 'MongoError') {
    if (error.code === 11000) {
      return new AppError('Duplicate key error', ErrorCode.CONFLICT);
    }
  }

  // Default error
  return new AppError('An unexpected error occurred',ErrorCode.INTERNAL_SERVER_ERROR);
};

/**
 * Middleware to handle 404 Not Found errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};