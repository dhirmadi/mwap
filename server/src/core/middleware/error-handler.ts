import { ErrorRequestHandler } from 'express';
import { AppError } from '../types/errors';
import { env } from '../config/environment';

// Declare module augmentation for Express Request
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      [key: string]: any;
    };
  }
}

// Simple logger for now - can be replaced with a proper logging service
const logger = {
  error: (message: string, meta: any) => {
    console.error(message, meta);
  }
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next): void => {
  try {
    // Generate request ID if not present
    const requestId = req.headers['x-request-id'] || 
                     req.headers['x-correlation-id'] || 
                     Math.random().toString(36).substring(7);

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
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          data: err.data,
          requestId
        }
      });
      return;
    }

    // Handle validation errors from express-validator
    if (err.array && typeof err.array === 'function') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          data: err.array(),
          requestId
        }
      });
      return;
    }

    // Handle MongoDB validation errors
    if (err.name === 'ValidationError') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Database validation failed',
          data: Object.values(err.errors).map((e: any) => ({
            field: e.path,
            message: e.message
          })),
          requestId
        }
      });
      return;
    }

    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      res.status(409).json({
        error: {
          code: 'CONFLICT_ERROR',
          message: 'Duplicate entry',
          data: {
            field: Object.keys(err.keyPattern)[0],
            value: Object.values(err.keyValue)[0]
          },
          requestId
        }
      });
      return;
    }

    // Default error response
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: env.isDevelopment() ? err.message : 'An unexpected error occurred',
        requestId
      }
    });
  } catch (error) {
    // Fallback error handler in case something goes wrong in our error handler
    logger.error('Error in error handler:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId: 'internal_error'
      }
    });
  }
};