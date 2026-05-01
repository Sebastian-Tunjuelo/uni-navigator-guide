import { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

/**
 * Custom error types
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError (custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle other errors
  const statusCode = 500;
  const message = 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
    timestamp: new Date().toISOString(),
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`404: ${req.method} ${req.path}`);

  res.status(404).json({
    error: 'Not found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
}
