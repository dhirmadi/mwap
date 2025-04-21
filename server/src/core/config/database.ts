import mongoose, { ConnectOptions, ConnectionStates } from 'mongoose';
import { env } from './environment';
import { logger } from '@core/utils/logger';

// Set global mongoose options
mongoose.set("bufferTimeoutMS", 30000); // Increase buffer timeout to 30 seconds

interface ExtendedConnectOptions extends ConnectOptions {
  maxPoolSize?: number;
  minPoolSize?: number;
  socketTimeoutMS?: number;
  serverSelectionTimeoutMS?: number;
  family?: number;
  retryWrites?: boolean;
  ssl?: boolean;
  authSource?: string;
}

// Connection readiness check with retry
export const ensureConnection = async (retries = 3, backoff = 1000): Promise<void> => {
  const isConnected = mongoose.connection.readyState === 1; // 1 = connected
  if (isConnected) return;

  let attempts = 0;
  while (attempts < retries) {
    try {
      const isConnected = mongoose.connection.readyState === 1; // 1 = connected
      if (isConnected) return;

      logger.warn('Waiting for MongoDB connection', {
        attempt: attempts + 1,
        maxRetries: retries,
        currentState: mongoose.connection.readyState
      });

      await new Promise<void>((resolve) => {
        const checkConnection = () => {
          const isConnected = mongoose.connection.readyState === 1; // 1 = connected
          if (isConnected) {
            resolve();
          } else {
            setTimeout(checkConnection, backoff);
          }
        };
        checkConnection();
      });

      return;
    } catch (error) {
      attempts++;
      if (attempts === retries) {
        throw new Error('Failed to establish MongoDB connection');
      }
      await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, attempts)));
    }
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    const options: ExtendedConnectOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // Connect to MongoDB
    logger.info('Connecting to MongoDB', {
      host: process.env.MONGO_URI?.split('@')[1]?.split('/')[0] || 'unknown',
      options: {
        ...options,
        // Don't log sensitive data
        user: undefined,
        pass: undefined,
        authSource: undefined
      }
    });

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    logger.info('MongoDB Connected', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
      readyState: conn.connection.readyState
    });

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      logger.error('MongoDB connection error', {
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState
      });
      if (!env.isDevelopment()) {
        process.exit(1);
      }
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...', {
        host: mongoose.connection.host,
        lastReadyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected', {
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        logger.info('Closing MongoDB connection due to app termination');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed successfully');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB shutdown', {
          error: err instanceof Error ? {
            name: err.name,
            message: err.message,
            stack: err.stack
          } : err
        });
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      mongoUri: process.env.MONGO_URI ? 'present' : 'missing'
    });
    if (!env.isDevelopment()) {
      process.exit(1);
    }
  }
};