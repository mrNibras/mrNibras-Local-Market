import logger from '../utils/logger.js';
import envVars from '../../config/env.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, errorCode = 'API_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(404, message, true, errorCode);
  }
}

/**
 * Bad Request Error
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', errorCode = 'BAD_REQUEST') {
    super(400, message, true, errorCode);
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(401, message, true, errorCode);
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(403, message, true, errorCode);
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', errorCode = 'CONFLICT') {
    super(409, message, true, errorCode);
  }
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let status = err.status || 'error';

  // Log error
  if (statusCode >= 500) {
    logger.error(`${err.message} - ${err.stack}`);
  } else {
    logger.warn(`${err.message} - ${req.path}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
    errorCode = 'VALIDATION_ERROR';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
    errorCode = 'DUPLICATE_KEY';
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errorCode = 'INVALID_ID';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    status,
    ...(envVars.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default errorHandler;
