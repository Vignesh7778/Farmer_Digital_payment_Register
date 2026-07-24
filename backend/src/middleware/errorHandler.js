export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const status = err.status || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  // PostgreSQL error code mapping
  if (err.code === '23505') {
    response.message = 'A record with this unique field details already exists.';
    return res.status(409).json(response);
  }
  
  if (err.code === '23514') {
    response.message = 'Check constraint failed. Please verify that your numeric inputs are valid.';
    return res.status(400).json(response);
  }

  res.status(status).json(response);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
