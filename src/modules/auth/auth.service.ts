import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../config/env';
import { TokenPayload, AuthTokens, TokenValidationResult } from './auth.types';
import { UserResponse } from '../user/user.types';
import * as userRepository  from '../user/user.repository';
import { AppError, AuthenticationError, NotFoundError } from '../../shared/types/errors';
import { logger } from '../../shared/utils/logger/logger';


export const generateTokens = (user: UserResponse): AuthTokens => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = jwt.sign(
    payload,
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );

  const refreshToken = jwt.sign(
    payload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );

  return { accessToken, refreshToken };
};


export const verifyToken = (token: string, type: 'access' | 'refresh'): TokenValidationResult => {
  try {
    const secret = type === 'access' 
      ? config.jwt.accessSecret 
      : config.jwt.refreshSecret;
    
    const payload = jwt.verify(token, secret) as TokenPayload;
    
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: 'Token has expired',
      };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        valid: false,
        error: 'Invalid token',
      };
    }
    return {
      valid: false,
      error: 'Token validation failed',
    };
  }
};



export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  // Verify refresh token
  const result = verifyToken(refreshToken, 'refresh');
  
  if (!result.valid || !result.payload) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  // Check if user still exists
  const user = await userRepository.findById(result.payload.userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Generate new access token
  const newPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = jwt.sign(
    newPayload,
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );

  logger.info(`Token refreshed for user: ${user.email}`, {
    userId: user.id,
    email: user.email,
  });

  return { accessToken };
};


export const validateCredentials = async (email: string, password: string): Promise<UserResponse> => {
  
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Return safe user data
  const { password: _, ...safeUser } = user;
  return safeUser as UserResponse;
};


export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  // Get user with password
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await userRepository.update(userId, { password: hashedPassword });

  logger.info(`Password changed for user: ${user.email}`, {
    userId: user.id,
    email: user.email,
  });
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

/**
 * Get user from token
 */
export const getUserFromToken = async (token: string, type: 'access' | 'refresh'): Promise<UserResponse> => {
  const result = verifyToken(token, type);
  
  if (!result.valid || !result.payload) {
    throw new AuthenticationError('Invalid token');
  }

  const user = await userRepository.findById(result.payload.userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  const { password: _, ...safeUser } = user;
  return safeUser as UserResponse;
};