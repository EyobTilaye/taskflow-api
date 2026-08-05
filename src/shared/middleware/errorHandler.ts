import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger/logger';
import { sendError } from '../utils/response';

export const createAppError = (message: string, statusCode = 400, errors?: any[]) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle our custom errors
  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return sendError(
      res,
      'A record with this value already exists',
      409
    );
  }
  
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400, err.errors);
  }

  // Default error
  const statusCode = process.env.NODE_ENV === 'production' ? 500 : 400;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return sendError(res, message, statusCode);
};