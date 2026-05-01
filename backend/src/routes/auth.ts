import { Router, Request, Response } from 'express';
import logger from '@/config/logger';
import { AuthService } from '@/services/auth.service';
import { requireAuth } from '@/middleware/auth';
import { ValidationError } from '@/middleware/errorHandler';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const result = await AuthService.signup(email, password);

    res.status(201).json({
      message: 'User created successfully',
      user: result.user,
      session: result.session,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const result = await AuthService.login(email, password);

    res.json({
      message: 'Logged in successfully',
      user: result.user,
      session: result.session,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (protected)
 */
router.post('/logout', requireAuth, async (req: Request, res: Response, next) => {
  try {
    await AuthService.logout();

    res.json({
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get current user (protected)
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  logger.info(`Auth: Getting user ${req.user?.id}`);

  res.json({
    user: req.user,
  });
});

export default router;
