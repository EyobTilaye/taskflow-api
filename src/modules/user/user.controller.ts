import { Request, Response } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { 
  RegisterUserDto, 
  LoginUserDto, 
  UpdateUserDto, 
  UserQueryDto 
} from './user.dto';
import { createAppError } from '../../shared/middleware/errorHandler';

// Type for authenticated request (will be extended later)
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}


export const register = asyncHandler(async (req: Request, res: Response) => {

  const userData = req.body as RegisterUserDto;

  const user = await userService.registerUser(userData);

  sendSuccess(res, user, 'User registered successfully', 201);
});


export const login = asyncHandler(async (req: Request, res: Response) => {

  const { email, password } = req.body as LoginUserDto;

  const user = await userService.loginUser(email, password);

  sendSuccess(res, user, 'Login successful');
});

/**
 * Get current user profile
 * GET /api/users/profile
 * 
 * Response: { success, data: UserResponse }
 * Requires: Authentication (userId from token)
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // 1. Get userId from authenticated request (set by auth middleware)
  const userId = req.user?.userId;
  
  if (!userId) {
    throw createAppError('Not authenticated', 401);
  }

  const user = await userService.getUserById(userId);

  sendSuccess(res, user, 'Profile retrieved successfully');
});


export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  
  const { id } = req.params;

  const user = await userService.getUserById(id);

  sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * Update user
 * PUT /api/users/:id
 * 
 * Params: { id }
 * Request Body: { name?, email?, password?, avatar?, isVerified? }
 * Response: { success, data: UserResponse }
 * Requires: Authentication + Authorization (must be same user)
 */
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // 1. Get user ID from URL params and auth token
  const { id } = req.params;
  const userId = req.user?.userId;

  // 2. Check if user is updating their own profile
  if (!userId) {
    throw createAppError('Not authenticated', 401);
  }

  if (id !== userId) {
    throw createAppError('You can only update your own profile', 403);
  }

  // 3. Get update data from request body
  const updateData = req.body as UpdateUserDto;

  // 4. Call service to update user
  const user = await userService.updateUser(id, updateData);

  // 5. Send success response
  sendSuccess(res, user, 'User updated successfully');
});

/**
 * Delete user
 * DELETE /api/users/:id
 * 
 * Params: { id }
 * Response: { success, data: null }
 * Requires: Authentication + Authorization (must be same user)
 */
export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // 1. Get user ID from URL params and auth token
  const { id } = req.params;
  const userId = req.user?.userId;

  // 2. Check if user is deleting their own account
  if (!userId) {
    throw createAppError('Not authenticated', 401);
  }

  if (id !== userId) {
    throw createAppError('You can only delete your own account', 403);
  }

  // 3. Call service to delete user
  await userService.deleteUser(id);

  // 4. Send success response with 204 No Content
  sendSuccess(res, null, 'User deleted successfully', 204);
});

/**
 * List users with pagination
 * GET /api/users
 * 
 * Query Params: { page?, limit?, search?, isVerified? }
 * Response: { success, data: PaginatedUsersResponse }
 * Requires: Authentication
 */
export const listUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // 1. Get query parameters
  const { page, limit, search, isVerified } = req.query as UserQueryDto;

  // 2. Call service to list users
  const result = await userService.listUsers({
    page: page || 1,
    limit: limit || 10,
    search: search || undefined,
    isVerified: isVerified,
  });

  // 3. Send success response
  sendSuccess(res, result, 'Users retrieved successfully');
});

/**
 * Verify email
 * POST /api/users/verify-email
 * 
 * Response: { success, data: UserResponse }
 * Requires: Authentication
 */
export const verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // 1. Get userId from authenticated request
  const userId = req.user?.userId;

  if (!userId) {
    throw createAppError('Not authenticated', 401);
  }

  // 2. Call service to verify email
  const user = await userService.verifyEmail(userId);

  // 3. Send success response
  sendSuccess(res, user, 'Email verified successfully');
});


/**
 * Update avatar
 * PATCH /api/users/:id/avatar
 * 
 * Params: { id }
 * Request Body: { avatar: string | null }
 * Response: { success, data: UserResponse }
 * Requires: Authentication + Authorization (must be same user)
 */
export const updateAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // 1. Get user ID from URL params and auth token
  const { id } = req.params;
  const userId = req.user?.userId;

  // 2. Check if user is updating their own avatar
  if (!userId) {
    throw createAppError('Not authenticated', 401);
  }

  if (id !== userId) {
    throw createAppError('You can only update your own avatar', 403);
  }

  // 3. Get avatar URL from request body
  const { avatar } = req.body;

  if (avatar === undefined) {
    throw createAppError('Avatar URL is required', 400);
  }

  // 4. Call service to update avatar
  const user = await userService.updateAvatar(id, avatar);

  // 5. Send success response
  sendSuccess(res, user, 'Avatar updated successfully');
});