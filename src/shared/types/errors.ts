
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: any[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 400,
    errors?: any[],
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}


export class ValidationError extends AppError {
  constructor(errors: any[]) {
    super('Validation failed', 400, errors);
    this.name = 'ValidationError';
  }
}


export class AuthenticationError extends AppError {
  constructor(message: string = 'Not authenticated') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}


export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}


export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}


export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}


export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', originalError?: any) {
    super(message, 500, originalError ? [originalError.message] : undefined);
    this.name = 'DatabaseError';
  }
}