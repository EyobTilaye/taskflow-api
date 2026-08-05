import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message: message || 'Operation successful',
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any[]
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || [],
    timestamp: new Date().toISOString(),
  });
};

export const sendNotFound = (res: Response, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message = 'Forbidden') => {
  return sendError(res, message, 403);
};

export const sendValidationError = (res: Response, errors: any[]) => {
  return sendError(res, 'Validation error', 400, errors);
};