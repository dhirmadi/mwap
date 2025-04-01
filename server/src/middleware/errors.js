class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Development error response
    console.error('ERROR:', err);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production error handling
  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      status: 'fail',
      message: 'Invalid token or authorization failed'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      status: 'fail',
      message: 'Your token has expired! Please log in again.'
    });
  }

  // Operational, trusted error: send message to client
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  }

  // Programming or other unknown error: don't leak error details
  console.error('ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

module.exports = { errorHandler, AppError };