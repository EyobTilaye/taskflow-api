import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.dto';
import {
  login,
  refresh,
  logout,
  getMe,
  changePasswordController,
} from './auth.controller';

const router = Router();

// Public routes
router.post(
  '/login',
  validate(loginSchema),
  login
);  

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  refresh
);

// Protected routes
router.use(authenticate); 

router.get(
  '/me',
  getMe
);

router.post(
  '/logout',
  logout
);

router.post(
  '/change-password',
  validate(changePasswordSchema),
  changePasswordController
);

export const authRoutes = router;