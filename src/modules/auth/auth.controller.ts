import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { LoginDto, ChangePasswordDto } from './auth.dto';
import { AuthenticationError } from '../../shared/types/errors';
import {
  generateTokens,
  refreshAccessToken,
  validateCredentials,
  changePassword,
} from './auth.service';
import { logger } from '../../shared/utils/logger/logger';

/**
 * Login controller
 * POST /auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginDto;

  const user = await validateCredentials(email, password);

  const tokens = generateTokens(user);

  // Log login
  logger.info(`User logged in: ${user.email}`, {
    userId: user.id,
    email: user.email,
  });

  // Send response
  sendSuccess(res, { user, tokens }, 'Login successful');
});

/**
 * Refresh token controller
 * POST /auth/refresh
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token required');
  }

  const result = await refreshAccessToken(refreshToken);

  sendSuccess(res, result, 'Token refreshed successfully');
});

/**
 * Logout controller
 * POST /auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Invalidate refresh token (if stored in database)
  
  sendSuccess(res, null, 'Logout successful');
});

/**
 * Get current user controller
 * GET /auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {

  const user = req.user;
  
  if (!user) {
    throw new AuthenticationError('Not authenticated');
  }

  // Get full user details from service (using user service)
  // We'll import from user service
  const { getUserById } = await import('../user/user.service');
  const userDetails = await getUserById(user.userId);

  sendSuccess(res, userDetails, 'User profile retrieved');
});

/**
 * Change password controller
 * POST /auth/change-password
 */
export const changePasswordController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  
  if (!user) {
    throw new AuthenticationError('Not authenticated');
  }

  const { currentPassword, newPassword } = req.body as ChangePasswordDto;

  await changePassword(user.userId, currentPassword, newPassword);

  sendSuccess(res, null, 'Password changed successfully');
});