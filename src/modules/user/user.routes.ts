import { Router } from 'express';
import * as userController from './user.controller';
import { validate } from '../../shared/middleware/validate';
import { 
  registerUserSchema, 
  loginUserSchema, 
  updateUserSchema,
  userQuerySchema 
} from './user.dto';
import { authenticate } from '../../shared/middleware/auth';

// Create router instance
const router = Router();


router.post(
  '/register',
  validate(registerUserSchema),  // Validate request body against schema
  userController.register
);


router.post(
  '/login',
  validate(loginUserSchema),  // Validate request body against schema
  userController.login
);


/**
 * Get current user profile
 * GET /api/users/profile
 * 
 * Headers: Authorization: Bearer <token>
 * Response: Current user's profile
 */
router.get(
  '/profile',
  authenticate,
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
  authenticate,
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
  authenticate,
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
  authenticate,
  validate(userQuerySchema, 'query'),  // Validate query parameters
  userController.listUsers
);

export const userRoutes = router;