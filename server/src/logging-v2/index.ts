import pino from 'pino';
import { config } from '../core-v2/config';

/**
 * Log levels type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Context object type for structured logging
 */
export interface LogContext {
  [key: string]: unknown;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  path?: string;
  error?: Error | unknown;
}

/**
 * Logger interface defining the required methods
 */
export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

/**
 * Console-based logger implementation
 */
class ConsoleLogger implements Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    };

    // Format error objects properly
    if (context?.error instanceof Error) {
      logData.error = {
        name: context.error.name,
        message: context.error.message,
        stack: context.error.stack,
      };
    }

    return JSON.stringify(logData);
  }

  debug(message: string, context?: LogContext): void {
    if (config.LOG_LEVEL === 'debug') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (['debug', 'info'].includes(config.LOG_LEVEL)) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (['debug', 'info', 'warn'].includes(config.LOG_LEVEL)) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }
}

/**
 * Pino-based logger implementation
 */
class PinoLogger implements Logger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: config.LOG_LEVEL,
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // Datadog formatting
      messageKey: 'message',
      errorKey: 'error',
      base: undefined,
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
          },
        },
      }),
    });
  }

  private formatContext(context?: LogContext): Record<string, unknown> {
    if (!context) return {};

    const formatted = { ...context };

    // Format Error objects for better logging
    if (context.error instanceof Error) {
      formatted.error = {
        name: context.error.name,
        message: context.error.message,
        stack: context.error.stack,
      };
    }

    return formatted;
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatContext(context), message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.formatContext(context), message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatContext(context), message);
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(this.formatContext(context), message);
  }
}

/**
 * Create a logger instance based on configuration
 */
function createLogger(): Logger {
  try {
    // Check if pino is available
    require.resolve('pino');
    return new PinoLogger();
  } catch (error) {
    // Fallback to console logger if pino is not installed
    console.warn('Pino not found, falling back to console logger');
    return new ConsoleLogger();
  }
}

/**
 * Exported logger instance
 */
export const logger = createLogger();

/**
 * Express middleware for request logging
 */
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();

    // Log request
    logger.info('Incoming request', {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
      });
    });

    // Attach logger to request for use in routes
    req.log = (level: LogLevel, message: string, context?: LogContext) => {
      logger[level](message, {
        requestId,
        ...context,
      });
    };

    next();
  };
}