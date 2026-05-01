import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from '@/config/env';
import logger from '@/config/logger';
import { testSupabaseConnection } from '@/config/supabase';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Import routes
import healthRoutes from '@/routes/health';
import authRoutes from '@/routes/auth';
import chatRoutes from '@/routes/chat';
import campusRoutes from '@/routes/campus';

const app: Express = express();

// ============================================
// MIDDLEWARE
// ============================================

// Logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Frontend URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// JSON body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// ============================================
// ROUTES
// ============================================

// Health check (no auth required)
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Chat routes (with auth)
app.use('/api/chat', chatRoutes);

// Campus routes (with optional/required auth)
app.use('/api/campus', campusRoutes);

// Root path
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Virtual University Concierge API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      chat: '/api/chat',
      campus: '/api/campus',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must be last)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER INITIALIZATION
// ============================================

async function startServer() {
  try {
    // Test Supabase connection
    const isSupabaseReady = await testSupabaseConnection();

    if (!isSupabaseReady) {
      logger.warn('WARNING: Supabase connection test failed. Some features may not work.');
    }

    // Start listening
    app.listen(config.port, () => {
      logger.info(`✓ Server running on http://localhost:${config.port}`);
      logger.info(`✓ Environment: ${config.nodeEnv}`);
      logger.info(`✓ CORS enabled for: http://localhost:5173, http://localhost:3000`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err}`);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err}`);
  process.exit(1);
});

// Start server
startServer();

export default app;
