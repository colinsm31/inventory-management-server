// Handles unexpected errors that are not predefined within the controllers

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
