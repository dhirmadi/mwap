import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app';
import { connectDB } from '@core/config/database';
import { env } from '@core/config/environment';
import { logger } from '@core/utils/logger';

// Connect to database
connectDB();

// Start server
const server = app.listen(env.port, () => {
  logger.info('Server started', {
    port: env.port,
    environment: env.nodeEnv
  });
});

// Graceful shutdown
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds

const shutdown = async (signal: string) => {
  let exitCode = 0;
  const shutdownStart = Date.now();

  logger.info('Starting graceful shutdown...', { signal });

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Shutdown timed out after ${SHUTDOWN_TIMEOUT}ms`));
      }, SHUTDOWN_TIMEOUT);
    });

    // Create a shutdown promise that handles all cleanup
    const shutdownPromise = (async () => {
      // 1. Stop accepting new requests
      logger.info('Stopping server from accepting new connections...');
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error('Error closing server', { error: err.message });
            reject(err);
          } else {
            logger.info('Server stopped accepting new connections');
            resolve();
          }
        });
      });

      // 2. Close database connections
      logger.info('Closing database connections...');
      await mongoose.disconnect();
      logger.info('Database connections closed');

      // 3. Any other cleanup can be added here
      // For example, closing cache connections, file handles, etc.

      const shutdownDuration = Date.now() - shutdownStart;
      logger.info('Graceful shutdown completed', { 
        durationMs: shutdownDuration,
        signal 
      });
    })();

    // Race between timeout and shutdown
    await Promise.race([shutdownPromise, timeoutPromise]);
  } catch (error) {
    logger.error('Error during shutdown', {
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - shutdownStart,
      signal
    });
    exitCode = 1;
  } finally {
    // Ensure we exit even if something goes wrong
    process.exit(exitCode);
  }
};

// Handle different termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { 
    reason: reason instanceof Error ? reason.message : 'Unknown reason'
  });
  shutdown('unhandledRejection');
});
