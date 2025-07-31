const {
  formatErrorForResponse,
  logErrorWithContext,
  isOperationalError,
  BaseError,
} = require("../utils/errors");

// Global error handler middleware
const errorHandler = (error, req, res, next) => {
  // Log error with context
  logErrorWithContext(error, {
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Format error response
  const errorResponse = formatErrorForResponse(error);

  // Set response status
  res.status(errorResponse.statusCode);

  // Send error response
  res.json(errorResponse);
};

// Async error wrapper for controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFoundHandler = (req, res) => {
  const error = new BaseError(`Route ${req.originalUrl} not found`, 404);
  const errorResponse = formatErrorForResponse(error);

  res.status(404).json(errorResponse);
};

// Validation error handler
const validationErrorHandler = (error, req, res, next) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    const validationError = new BaseError(
      error.message || "Validation failed",
      400
    );
    const errorResponse = formatErrorForResponse(validationError);

    return res.status(400).json(errorResponse);
  }

  next(error);
};

// Database error handler
const databaseErrorHandler = (error, req, res, next) => {
  if (error.code === "P2002") {
    const dbError = new BaseError("Duplicate entry found", 409);
    const errorResponse = formatErrorForResponse(dbError);

    return res.status(409).json(errorResponse);
  }

  if (error.code === "P2025") {
    const dbError = new BaseError("Record not found", 404);
    const errorResponse = formatErrorForResponse(dbError);

    return res.status(404).json(errorResponse);
  }

  if (error.code === "P2003") {
    const dbError = new BaseError("Foreign key constraint failed", 400);
    const errorResponse = formatErrorForResponse(dbError);

    return res.status(400).json(errorResponse);
  }

  next(error);
};

// Rate limiting error handler
const rateLimitErrorHandler = (error, req, res, next) => {
  if (error.type === "entity.too.large") {
    const limitError = new BaseError("Request entity too large", 413);
    const errorResponse = formatErrorForResponse(limitError);

    return res.status(413).json(errorResponse);
  }

  next(error);
};

// Unhandled error handler
const unhandledErrorHandler = (error, req, res, next) => {
  // Log unhandled errors
  console.error("🚨 Unhandled Error:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Send generic error response
  const errorResponse = {
    success: false,
    error: "Internal server error",
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(errorResponse);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationErrorHandler,
  databaseErrorHandler,
  rateLimitErrorHandler,
  unhandledErrorHandler,
};
