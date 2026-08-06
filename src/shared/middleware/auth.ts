import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../modules/auth/auth.service';
import { AuthenticationError } from '../types/errors';
import { logger } from '../utils/logger/logger';
import { TokenPayload } from '../../modules/auth/auth.types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}


const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  // Check if header starts with "Bearer "
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token
    const token = extractToken(req);
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const result = verifyToken(token, 'access');
    if (!result.valid || !result.payload) {
      throw new AuthenticationError(result.error || 'Invalid token');
    }

    // Attach user to request
    req.user = result.payload;
    
    logger.debug('User authenticated', {
      userId: result.payload.userId,
      email: result.payload.email,
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Does not throw error if no token provided
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    if (token) {
      const result = verifyToken(token, 'access');
      if (result.valid && result.payload) {
        req.user = result.payload;
      }
    }
    next();
  } catch {
    // Silent fail - just continue without user
    next();
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    // This will be expanded when we add roles
    // For now, just allow all authenticated users
    next();
  };
};

/**
 * Permission middleware (for future use with roles)
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    // TODO: Check permissions based on user's roles
    // For now, allow all authenticated users
    next();
  };
};