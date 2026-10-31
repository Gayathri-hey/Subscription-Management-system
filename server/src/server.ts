import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { config } from './config/env';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Attempt database connection
    try {
      await connectDB();
    } catch (dbError) {
      if (config.NODE_ENV === 'production') {
        logger.error('Fatal: Failed to connect to MongoDB in production mode.', dbError);
        process.exit(1);
      } else {
        logger.warn(
          '⚠️ MongoDB connection could not be established immediately. Server will start in degraded mode. Health check will report database status.'
        );
      }
    }

    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      logger.info(`📡 Health check available at http://localhost:${config.PORT}/api/health`);
    });

    // ─── Graceful Shutdown ───────────────────────────────────────────────────────
    let isShuttingDown = false;
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`🛑 ${signal} received. Initiating graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await disconnectDB();
        } catch (err) {
          logger.error('Error disconnecting database during shutdown:', err);
        } finally {
          logger.info('Graceful shutdown complete.');
          process.exit(0);
        }
      });

      // Force shutdown after 10 seconds timeout
      setTimeout(() => {
        logger.error('Forcefully terminating process after shutdown timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
      shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to initialize server application:', error);
    process.exit(1);
  }
};

startServer();
