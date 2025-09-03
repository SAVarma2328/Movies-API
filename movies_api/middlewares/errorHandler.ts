import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/custom-error';
import { ERROR_MESSAGES } from '../constants/errors';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Log the error
  logger.error('Global error handler caught error', err, {
    transactionId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  }, {
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle validation errors from express-validator or similar
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message || ERROR_MESSAGES.BAD_REQUEST,
      },
    });
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON format in request body',
      },
    });
    return;
  }

  // Handle database constraint errors
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_ERROR') {
    res.status(500).json({
      success: false,
      error: {
        code: 'DB_ERROR',
        message: ERROR_MESSAGES.DATABASE_QUERY_ERROR,
      },
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    },
  });
}

// 404 handler for unmatched routes
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found', {
    transactionId: `404_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}