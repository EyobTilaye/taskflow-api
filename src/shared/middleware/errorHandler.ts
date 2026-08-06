import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger/logger';
import { sendError } from '../utils/response';

export const createAppError = (
  message: string,
  statusCode = 400,
  errors: any[] = []
) => {
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
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Our custom errors
  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode, err.errors || []);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  // Zod errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    return sendError(res, 'Validation error', 400, formattedErrors);
  }

  // Default
  const statusCode = process.env.NODE_ENV === 'production' ? 500 : 400;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return sendError(res, message, statusCode);
};