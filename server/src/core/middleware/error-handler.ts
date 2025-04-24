import { ErrorRequestHandler, Request } from 'express';
import { AppError } from '../errors';
import { env } from '../config/environment';
import {
  ErrorResponseBase,
  ValidationErrorResponse,
  DuplicateKeyErrorResponse,
  MongoError,
  MongoValidationError,
  ValidatorError
} from '../types/responses';

import { User } from '../types/auth';

// Use standard Request type with Express namespace extension
type AuthenticatedRequest = Request;

import { logger } from '../logging';

// Helper function to generate request ID
const generateRequestId = (req: AuthenticatedRequest): string => {
  return (req.headers['x-request-id'] as string) || 
         (req.headers['x-correlation-id'] as string) || 
         Math.random().toString(36).substring(7);
};

// Helper function to create base error response
const createErrorResponse = (
  code: string,
  message: string,
  requestId: string,
  data?: unknown
): ErrorResponseBase => ({
  error: { code, message, requestId, data }
});

export const errorHandler: ErrorRequestHandler = (err, req: AuthenticatedRequest, res, next): void => {
  try {
    const requestId = generateRequestId(req);

    // Log error with context
    logger.error('Error:', {
      name: err.name,
      message: err.message,
      stack: env.isDevelopment() ? err.stack : undefined,
      path: req.path,
      method: req.method,
      requestId,
      timestamp: new Date().toISOString(),
      query: req.query,
      body: env.isDevelopment() ? req.body : undefined,
      user: req.user ? { id: req.user.id } : undefined
    });

    // Handle AppError instances
    if (err instanceof AppError) {
      res.status(err.statusCode).json(
        createErrorResponse(err.code || 'INTERNAL_ERROR', err.message, requestId, err.metadata)
      );
      return;
    }

    // Handle validation errors from express-validator
    if (err.array && typeof err.array === 'function') {
      try {
        const validatorError = err as ValidatorError;
        const errorData = validatorError.array();
        
        const response: ValidationErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            data: errorData.map(e => ({
              field: e.field,
              message: e.message
            })),
            requestId
          }
        };
        
        res.status(400).json(response);
        return;
      } catch (validationError) {
        logger.error('Error processing validation error:', { error: validationError });
        // Fall through to default error handler
      }
    }

    // Handle MongoDB validation errors
    if (err.name === 'ValidationError') {
      try {
        const mongoError = err as MongoValidationError;
        const errorData = Object.entries(mongoError.errors).map(([field, error]) => ({
          field: error.path || field,
          message: error.message || 'Validation failed'
        }));

        const response: ValidationErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Database validation failed',
            data: errorData,
            requestId
          }
        };

        res.status(400).json(response);
        return;
      } catch (validationError) {
        logger.error('Error processing MongoDB validation error:', { error: validationError });
        // Fall through to default error handler
      }
    }

    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      try {
        const mongoError = err as MongoError;
        const field = mongoError.keyPattern ? Object.keys(mongoError.keyPattern)[0] : 'unknown';
        const value = mongoError.keyValue ? Object.values(mongoError.keyValue)[0] : 'unknown';

        const response: DuplicateKeyErrorResponse = {
          error: {
            code: 'CONFLICT_ERROR',
            message: 'Duplicate entry',
            data: { field, value },
            requestId
          }
        };

        res.status(409).json(response);
        return;
      } catch (duplicateError) {
        logger.error('Error processing MongoDB duplicate key error:', { error: duplicateError });
        // Fall through to default error handler
      }
    }

    // Default error response
    res.status(500).json(
      createErrorResponse(
        'INTERNAL_ERROR',
        env.isDevelopment() ? err.message : 'An unexpected error occurred',
        requestId
      )
    );
  } catch (error) {
    // Fallback error handler in case something goes wrong in our error handler
    logger.error('Error in error handler:', { error });
    res.status(500).json(
      createErrorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        'internal_error'
      )
    );
  }
};