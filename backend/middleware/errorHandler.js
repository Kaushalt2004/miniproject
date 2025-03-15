// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`, err.stack); // Log error for debugging
  
    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: err.message });
    }
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
  
    // Default to 500 for unhandled errors
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  };
  
  module.exports = errorHandler;