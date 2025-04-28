import winston from 'winston';
import { env } from '@core/config/environment';

import { logfmtFormat } from './logfmt';

/**
 * Custom format for log output
 * - Adds timestamp
 * - Adds environment metadata
 * - Formats in logfmt format
 */
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    // Add environment metadata
    info.env = env.nodeEnv;
    info.service = 'mwap-server';
    return info;
  })(),
  logfmtFormat()
);

/**
 * Winston logger configuration
 * - Console transport only (for Heroku)
 * - Log level based on environment
 * - JSON format for structured logging
 */
export const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  format: customFormat,
  defaultMeta: {
    service: 'mwap-server',
    environment: env.nodeEnv,
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
if (env.nodeEnv === 'development') {
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
    // Create a new WeakSet instead of clearing the existing one
    seen = new WeakSet();
  }
};

// Set for tracking circular references
let seen = new WeakSet();

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