import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app';
import { connectDB } from '@core-v2/database';
import { config } from '@core-v2/config';
import { logger } from '@core-v2/logging';
import { createRedisClient } from '@core-v2/cache/redis';
import { MetricsReporter } from '@core-v2/monitoring/metrics';
import { validateEnvironment } from '@core-v2/config/validate';

// Application startup sequence
async function startServer() {
  const startTime = Date.now();
  
  try {
    // 1. Validate environment
    logger.info('Validating environment configuration...');
    validateEnvironment();

    // 2. Initialize metrics reporter
    const metrics = new MetricsReporter();
    
    // 3. Connect to Redis
    logger.info('Connecting to Redis...');
    const redis = await createRedisClient();
    
    // 4. Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDB();
    
    // 5. Start HTTP server
    const server = app.listen(config.port, () => {
      const startupDuration = Date.now() - startTime;
      logger.info('Server started successfully', {
        port: config.port,
        environment: config.nodeEnv,
        startupDuration: `${startupDuration}ms`,
        mongodb: {
          host: config.mongodb.host,
          database: config.mongodb.database
        },
        redis: {
          host: config.redis.host,
          database: config.redis.database
        }
      });
      
      // Report startup metrics
      metrics.recordStartup({
        duration: startupDuration,
        success: true
      });
    });

    return { server, redis, metrics };
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    process.exit(1);
  }
}

// Graceful shutdown
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds

interface ServerContext {
  server: ReturnType<typeof app.listen>;
  redis: Awaited<ReturnType<typeof createRedisClient>>;
  metrics: MetricsReporter;
}

async function shutdown(signal: string, context?: ServerContext) {
  let exitCode = 0;
  const shutdownStart = Date.now();

  logger.info('Starting graceful shutdown...', { 
    signal,
    hasContext: !!context 
  });

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Shutdown timed out after ${SHUTDOWN_TIMEOUT}ms`));
      }, SHUTDOWN_TIMEOUT);
    });

    // Create a shutdown promise that handles all cleanup
    const shutdownPromise = (async () => {
      if (context) {
        // 1. Stop metrics reporting
        logger.info('Stopping metrics reporter...');
        await context.metrics.flush();
        
        // 2. Stop accepting new requests
        logger.info('Stopping server from accepting new connections...');
        await new Promise<void>((resolve, reject) => {
          context.server.close((err) => {
            if (err) {
              logger.error('Error closing server', { error: err.message });
              reject(err);
            } else {
              logger.info('Server stopped accepting new connections');
              resolve();
            }
          });
        });

        // 3. Close Redis connection
        logger.info('Closing Redis connection...');
        await context.redis.quit();
        logger.info('Redis connection closed');
      }

      // 4. Close database connections
      logger.info('Closing MongoDB connection...');
      await mongoose.disconnect();
      logger.info('MongoDB connection closed');

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
}

// Initialize server and setup signal handlers
async function initialize() {
  let context: ServerContext | undefined;

  try {
    context = await startServer();

    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM', context));
    process.on('SIGINT', () => shutdown('SIGINT', context));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack
      });
      shutdown('uncaughtException', context);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', {
        reason: reason instanceof Error ? reason.message : 'Unknown reason',
        stack: reason instanceof Error ? reason.stack : undefined
      });
      shutdown('unhandledRejection', context);
    });

    // Monitor event loop
    setInterval(() => {
      const heap = process.memoryUsage();
      context?.metrics.recordMemoryUsage({
        heapTotal: heap.heapTotal,
        heapUsed: heap.heapUsed,
        external: heap.external,
        rss: heap.rss
      });
    }, 30000); // Every 30 seconds

  } catch (error) {
    logger.error('Failed to initialize server', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    await shutdown('initializationError');
  }
}

// Start the server
initialize().catch((error) => {
  logger.error('Critical initialization error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});
