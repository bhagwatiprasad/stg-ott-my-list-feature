import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types';
import { ERRORS, ROUTE_NOT_FOUND } from '../constants';
import { logger } from '../utils';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not Found error
export class NotFoundError extends ApiError {
  constructor(message: string = ERRORS.RESOURCE_NOT_FOUND, details?: string[]) {
    super(404, message, details);
    this.name = 'NotFoundError';
  }
}

// Conflict error (e.g., duplicate)
export class ConflictError extends ApiError {
  constructor(message: string = ERRORS.RESOURCE_ALREADY_EXISTS, details?: string[]) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

// Bad Request error
export class BadRequestError extends ApiError {
  constructor(message: string = ERRORS.BAD_REQUEST, details?: string[]) {
    super(400, message, details);
    this.name = 'BadRequestError';
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiResponse<null>>,
  _next: NextFunction
): void => {
  // Determine error level based on status code
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;
  
  // Log with appropriate level
  if (statusCode >= 500) {
    logger.error('Internal server error', error, {
      path: req.path,
      method: req.method,
      statusCode,
    });
  } else if (statusCode >= 400) {
    logger.warn(`Client error: ${error.message}`, {
      path: req.path,
      method: req.method,
      statusCode,
      errorName: error.name,
    });
  }

  // Handle API errors
  if (isApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      details: error.details,
    });
    return;
  }

  // Handle MongoDB duplicate key error
  if (error.name === 'MongoServerError' && (error as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: ERRORS.ITEM_ALREADY_IN_LIST,
    });
    return;
  }

  // Handle MongoDB CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: ERRORS.INVALID_ID_FORMAT,
      details: [ERRORS.INVALID_ID_DETAILS],
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: ERRORS.INTERNAL_SERVER_ERROR,
  });
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse<null>>
): void => {
  logger.debug(`Route not found: ${req.method} ${req.path}`);
  
  res.status(404).json({
    success: false,
    error: ERRORS.NOT_FOUND,
    details: [ROUTE_NOT_FOUND(req.method, req.path)],
  });
};

export default errorHandler;

