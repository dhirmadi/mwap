import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../../errors';
import { logger } from '../../logger';

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
      code: ErrorCode.INTERNAL_ERROR,
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
    return new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token');
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return new AppError(ErrorCode.VALIDATION_ERROR, error.message);
  }

  // Handle database errors
  if (error.name === 'MongoError') {
    if (error.code === 11000) {
      return new AppError(ErrorCode.DUPLICATE_ERROR, 'Duplicate key error');
    }
  }

  // Default error
  return new AppError(
    ErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred'
  );
};