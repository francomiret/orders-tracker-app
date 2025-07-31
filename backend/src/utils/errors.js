// Custom Error Classes for better error handling

class BaseError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// AlertRules Errors
class AlertRuleError extends BaseError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

class AlertRuleNotFoundError extends AlertRuleError {
  constructor(id) {
    super(`Alert rule with ID ${id} not found`, 404);
    this.alertRuleId = id;
  }
}

class AlertRuleValidationError extends AlertRuleError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
  }
}

class AlertRuleDuplicateError extends AlertRuleError {
  constructor(ruleType) {
    super(`An active rule of type '${ruleType}' already exists`, 409);
    this.ruleType = ruleType;
  }
}

// Notification Errors
class NotificationError extends BaseError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

class NotificationNotFoundError extends NotificationError {
  constructor(id) {
    super(`Notification with ID ${id} not found`, 404);
    this.notificationId = id;
  }
}

class NotificationValidationError extends NotificationError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
  }
}

// Database Errors
class DatabaseError extends BaseError {
  constructor(message, originalError = null) {
    super(message, 500);
    this.originalError = originalError;
  }
}

class DatabaseConnectionError extends DatabaseError {
  constructor(message = "Database connection failed") {
    super(message);
  }
}

class DatabaseQueryError extends DatabaseError {
  constructor(message, query = null) {
    super(message);
    this.query = query;
  }
}

// Validation Errors
class ValidationError extends BaseError {
  constructor(message, field = null, value = null) {
    super(message, 400);
    this.field = field;
    this.value = value;
  }
}

// Service Errors
class ServiceError extends BaseError {
  constructor(message, service = null) {
    super(message, 500);
    this.service = service;
  }
}

// Repository Errors
class RepositoryError extends BaseError {
  constructor(message, repository = null, operation = null) {
    super(message, 500);
    this.repository = repository;
    this.operation = operation;
  }
}

// Utility function to check if error is operational
const isOperationalError = (error) => {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
};

// Utility function to format error for response
const formatErrorForResponse = (error) => {
  if (error instanceof BaseError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      ...(error.field && { field: error.field }),
      ...(error.service && { service: error.service }),
      ...(error.repository && { repository: error.repository }),
      ...(error.operation && { operation: error.operation }),
    };
  }

  // For unknown errors
  return {
    success: false,
    error: "Internal server error",
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };
};

// Utility function to log error with context
const logErrorWithContext = (error, context = {}) => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof BaseError) {
    errorInfo.statusCode = error.statusCode;
    errorInfo.isOperational = error.isOperational;
  }

  console.error("🚨 Error occurred:", JSON.stringify(errorInfo, null, 2));

  return errorInfo;
};

module.exports = {
  // Base Error
  BaseError,

  // AlertRules Errors
  AlertRuleError,
  AlertRuleNotFoundError,
  AlertRuleValidationError,
  AlertRuleDuplicateError,

  // Notification Errors
  NotificationError,
  NotificationNotFoundError,
  NotificationValidationError,

  // Database Errors
  DatabaseError,
  DatabaseConnectionError,
  DatabaseQueryError,

  // Validation Errors
  ValidationError,

  // Service Errors
  ServiceError,

  // Repository Errors
  RepositoryError,

  // Utility Functions
  isOperationalError,
  formatErrorForResponse,
  logErrorWithContext,
};
