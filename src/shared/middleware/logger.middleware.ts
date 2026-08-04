import { NextFunction, Request, Response } from 'express';

export const loggerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Placeholder request logger
  req.requestId = req.headers['x-request-id'] as string | undefined;
  next();
};
