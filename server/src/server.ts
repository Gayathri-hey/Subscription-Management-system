import app from './app';
import { connectDB } from './config/database';
import { config } from './config/env';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      logger.info(`📡 API available at http://localhost:${config.PORT}/api/health`);
    });

    // ─── Graceful Shutdown ───────────────────────────────────────────────────────
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
