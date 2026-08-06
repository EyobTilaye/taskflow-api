// src/modules/user/user.routes.ts

import { Router } from 'express';
import * as userController from './user.controller';
import { validate } from '../../shared/middleware/validate';
import { 
  registerUserSchema, 
  loginUserSchema, 
  updateUserSchema,
  userQuerySchema 
} from './user.dto';
// TODO: Will be added later
// import { authenticate } from '../../shared/middleware/auth';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * Register new user
 * POST /api/users/register
 * 
 * Request Body:
 * - name: string (min 2 chars)
 * - email: string (valid email)
 * - password: string (min 8 chars, uppercase, lowercase, number)
 */
router.post(
  '/register',
  validate(registerUserSchema),  // Validate request body against schema
  userController.register
);

/**
 * Login user
 * POST /api/users/login
 * 
 * Request Body:
 * - email: string (valid email)
 * - password: string (min 1 char)
 */
router.post(
  '/login',
  validate(loginUserSchema),  // Validate request body against schema
  userController.login
);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * Get current user profile
 * GET /api/users/profile
 * 
 * Headers: Authorization: Bearer <token>
 * Response: Current user's profile
 */
router.get(
  '/profile',
  // TODO: authenticate,  // Will be added when auth middleware is ready
  userController.getProfile
);

/**
 * Verify email
 * POST /api/users/verify-email
 * 
 * Headers: Authorization: Bearer <token>
 * Verifies the authenticated user's email
 */
router.post(
  '/verify-email',
  // TODO: authenticate,
  userController.verifyEmail
);

/**
 * Get user by ID
 * GET /api/users/:id
 * 
 * Params: id - User ID
 * Headers: Authorization: Bearer <token>
 * Returns: User with the specified ID
 */
router.get(
  '/:id',
  // TODO: authenticate,
  userController.getUserById
);

/**
 * Update user
 * PUT /api/users/:id
 * 
 * Params: id - User ID
 * Headers: Authorization: Bearer <token>
 * Request Body: Any user fields to update
 * Note: User can only update their own profile
 */
router.put(
  '/:id',
  // TODO: authenticate,
  validate(updateUserSchema),  // Validate request body against schema
  userController.updateUser
);

/**
 * Delete user
 * DELETE /api/users/:id
 * 
 * Params: id - User ID
 * Headers: Authorization: Bearer <token>
 * Note: User can only delete their own account
 */
router.delete(
  '/:id',
  // TODO: authenticate,
  userController.deleteUser
);

/**
 * Update avatar
 * PATCH /api/users/:id/avatar
 * 
 * Params: id - User ID
 * Headers: Authorization: Bearer <token>
 * Request Body: { avatar: string | null }
 * Note: User can only update their own avatar
 */
router.patch(
  '/:id/avatar',
  // TODO: authenticate,
  userController.updateAvatar
);

/**
 * List users with pagination and search
 * GET /api/users
 * 
 * Query Params:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - search: string (searches name and email)
 * - isVerified: boolean
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/',
  // TODO: authenticate,
  validate(userQuerySchema, 'query'),  // Validate query parameters
  userController.listUsers
);

// Export routes
export const userRoutes = router;