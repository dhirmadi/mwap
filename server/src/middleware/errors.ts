import express, { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

interface IAppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: number;
  errmsg?: string;
}

export class AppError extends Error implements IAppError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ValidationError extends MongooseError.ValidationError {
  errors: {
    [key: string]: MongooseError.ValidatorError | MongooseError.CastError;
  };
}

interface CastError extends MongooseError.CastError {
  path: string;
  value: any;
}

const handleCastErrorDB = (err: CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: ValidationError): AppError => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  const match = err.errmsg?.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

export const errorHandler: express.ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Development error response
    console.error('ERROR:', err);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
    return;
  }

  // Production error handling
  const processedError = { ...err } as IAppError;
  processedError.message = err.message;

  // Handle specific error types
  if (err.name === 'CastError') {
    const handledError = handleCastErrorDB(err as unknown as CastError);
    processedError.message = handledError.message;
    processedError.statusCode = handledError.statusCode;
  }
  if (err.name === 'ValidationError') {
    const handledError = handleValidationErrorDB(err as unknown as ValidationError);
    processedError.message = handledError.message;
    processedError.statusCode = handledError.statusCode;
  }
  if (err.code === 11000) {
    const handledError = handleDuplicateFieldsDB(err as unknown as MongoError);
    processedError.message = handledError.message;
    processedError.statusCode = handledError.statusCode;
  }
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ 
      status: 'fail',
      message: 'Invalid token or authorization failed'
    });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ 
      status: 'fail',
      message: 'Your token has expired! Please log in again.'
    });
    return;
  }

  // Operational, trusted error: send message to client
  if (processedError.isOperational) {
    res.status(processedError.statusCode).json({
      status: processedError.status,
      message: processedError.message
    });
    return;
  }

  // Programming or other unknown error: don't leak error details
  console.error('ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};