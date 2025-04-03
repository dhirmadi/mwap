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
  // Log error for debugging
  console.error('ERROR:', err);

  // Set default status code
  err.statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Token expired'
    });
  }

  if (err.name === 'CastError') {
    const error = handleCastErrorDB(err);
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  if (err.name === 'ValidationError') {
    const error = handleValidationErrorDB(err);
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  if (err.code === 11000) {
    const error = handleDuplicateFieldsDB(err);
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  // Handle common Express errors
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: 'Invalid JSON format'
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request entity too large'
    });
  }

  if (err.status === 404 || err.statusCode === 404) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  // Handle 404 for non-existent routes
  if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Programming or other unknown error: don't leak error details
  return res.status(500).json({
    error: 'Internal server error'
  });
};

module.exports = { errorHandler, AppError };