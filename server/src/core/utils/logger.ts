import winston from 'winston';
import { env } from '@core/config/environment';

// Create base logger
const baseLogger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'mwap-api',
    environment: env.nodeEnv
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} ${level}: ${message} ${metaStr}`;
        })
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Enhanced error logging with proper type handling
const error = (message: string, error?: unknown): void => {
  if (error instanceof Error) {
    baseLogger.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  } else if (error !== undefined) {
    baseLogger.error(message, { error });
  } else {
    baseLogger.error(message);
  }
};

// Export enhanced logger with proper error handling
export const logger = {
  error,
  info: baseLogger.info.bind(baseLogger),
  warn: baseLogger.warn.bind(baseLogger),
  debug: baseLogger.debug.bind(baseLogger),
  verbose: baseLogger.verbose.bind(baseLogger)
};