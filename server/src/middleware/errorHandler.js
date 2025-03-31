const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.status(500).json({
    message: 'An unexpected error occurred',
  });
};

module.exports = { errorHandler };