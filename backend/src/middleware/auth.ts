import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import logger from '@/config/logger';
import { AuthUser } from '@/types/auth';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      token?: string;
    }
  }
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Optional authentication middleware
 * Tries to authenticate user but doesn't fail if no token
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    logger.debug('Auth: No token provided (optional auth)');
    return next();
  }

  AuthService.verifyToken(token)
    .then((user) => {
      if (user) {
        req.user = user;
        req.token = token;
        logger.debug(`Auth: User ${user.id} authenticated`);
      }
      next();
    })
    .catch((err) => {
      logger.warn(`Auth verification error: ${err}`);
      next(); // Continue even if verification fails
    });
}

/**
 * Required authentication middleware
 * Fails if no valid token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    logger.warn('Auth: Missing token on protected route');
    return res.status(401).json({ error: 'Authorization token required' });
  }

  AuthService.verifyToken(token)
    .then((user) => {
      if (!user) {
        logger.warn('Auth: Invalid token');
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = user;
      req.token = token;
      logger.debug(`Auth: User ${user.id} authenticated`);
      next();
    })
    .catch((err) => {
      logger.error(`Auth verification error: ${err}`);
      res.status(401).json({ error: 'Authentication failed' });
    });
}
