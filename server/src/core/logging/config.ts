import winston from 'winston';
import { env } from '@core/config/environment';

/**
 * Custom format for log output
 * - Adds timestamp
 * - Adds environment metadata
 * - Formats as JSON for better parsing
 */
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Basic fields
    const logData: Record<string, unknown> = {
      timestamp,
      level,
      message,
    };

    // Add environment metadata
    logData.env = env.NODE_ENV;
    logData.service = 'mwap-server';

    // Add any additional metadata
    if (Object.keys(meta).length > 0) {
      logData.meta = meta;
    }

    return JSON.stringify(logData);
  })
);

/**
 * Winston logger configuration
 * - Console transport only (for Heroku)
 * - Log level based on environment
 * - JSON format for structured logging
 */
export const logger = winston.createLogger({
  level: env.isDevelopment() ? 'debug' : 'info',
  format: customFormat,
  defaultMeta: {
    service: 'mwap-server',
    environment: env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  // Exit on error: false - let the process handle uncaught exceptions
  exitOnError: false,
});

/**
 * Development-specific settings
 */
if (env.isDevelopment()) {
  logger.debug('Logger initialized in development mode');
}

/**
 * Helper function to safely stringify objects for logging
 */
export const safeStringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (error) {
    return '[Unable to stringify value]';
  } finally {
    seen.clear();
  }
};

// Set for tracking circular references
const seen = new WeakSet();

/**
 * Log levels utility type
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Type-safe logging functions
 */
export const log = {
  error: (message: string, meta?: Record<string, unknown>) => {
    logger.error(message, meta);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, meta);
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(message, meta);
  },
};

// Export the logger instance
export default logger;