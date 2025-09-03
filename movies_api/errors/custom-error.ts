import { ERROR_CODES } from '../constants/errors';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number, isOperational = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, ERROR_CODES.NOT_FOUND, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, ERROR_CODES.DB_ERROR, 500);
  }
}

export class ExternalAPIError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 502);
  }
}

export class OMDBError extends ExternalAPIError {
  constructor(message: string) {
    super(message, ERROR_CODES.OMDB_ERROR);
  }
}

export class RatingsAPIError extends ExternalAPIError {
  constructor(message: string) {
    super(message, ERROR_CODES.RATINGS_API_ERROR);
  }
}