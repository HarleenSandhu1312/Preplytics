/**
 * middleware/errorHandler.js
 * ─────────────────────────────────────────────
 * ERROR HANDLING MIDDLEWARE
 *
 * Express error middleware has FOUR parameters: (err, req, res, next)
 * It must be registered LAST in app.js (after all routes).
 *
 * Flow:
 *   Route throws error → next(error) is called → lands here
 * ─────────────────────────────────────────────
 */

// Custom error class for operational errors (user-facing)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;   // Distinguish from unexpected programmer errors
  }
}

// ─── MAIN ERROR HANDLER ───────────────────────
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose bad ObjectId (e.g. /api/users/invalid-id)
  if (err.name === 'CastError') {
    message    = 'Resource not found — invalid ID format.';
    statusCode = 404;
  }

  // Mongoose duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message    = `Duplicate value: ${field} already exists.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message    = Object.values(err.errors).map(e => e.message).join('. ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message    = 'Invalid token. Please log in again.';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message    = 'Token expired. Please log in again.';
    statusCode = 401;
  }

  // Log internal errors to console (don't log 4xx — those are client mistakes)
  if (statusCode >= 500) {
    console.error('SERVER ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// ─── 404 HANDLER ─────────────────────────────
// Catches requests to routes that don't exist
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound, AppError };
