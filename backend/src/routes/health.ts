import { Router, Request, Response } from 'express';
import logger from '@/config/logger';
import { testSupabaseConnection } from '@/config/supabase';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  logger.debug('Health check');

  const isSupabaseConnected = await testSupabaseConnection();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabase: isSupabaseConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

export default router;
