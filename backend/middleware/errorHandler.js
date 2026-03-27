/**
 * Global Error Handler Middleware
 * Must be registered LAST in Express app (after all routes).
 */

// ── Custom Application Error class ─────────────────────────────────────────
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Mongoose error handlers ─────────────────────────────────────────────────
const handleCastError = (err) =>
  new AppError(`Invalid value for field '${err.path}': ${err.value}`, 400);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(
    `An account with this ${field} already exists. Please use a different ${field}.`,
    409
  );
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(messages.join('. '), 422);
};

// ── Development error response (verbose) ───────────────────────────────────
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

// ── Production error response (clean) ──────────────────────────────────────
const sendProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown/programming errors: don't leak details
  console.error('💥 UNHANDLED ERROR:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};

// ── Main error handler ──────────────────────────────────────────────────────
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err, message: err.message, name: err.name };

  // Normalize known Mongoose/MongoDB errors
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);

  const isApiRequest =
    req.path.startsWith('/api/') || req.headers.accept?.includes('application/json');

  if (isApiRequest) {
    if (process.env.NODE_ENV === 'development') return sendDevError(error, res);
    return sendProdError(error, res);
  }

  // EJS route errors → redirect with flash
  req.flash('error', error.message || 'An unexpected error occurred.');
  res.redirect('back');
};

// ── 404 handler for unknown routes ─────────────────────────────────────────
const notFoundHandler = (req, res, next) => {
  const isApiRequest = req.path.startsWith('/api/');
  if (isApiRequest) {
    return res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
  }
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404,
  });
};

module.exports = { globalErrorHandler, notFoundHandler, AppError };
