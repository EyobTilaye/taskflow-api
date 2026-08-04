import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(500).json({
    status: 'error',
    message: error.message || 'Internal server error'
  });
  next();
};
