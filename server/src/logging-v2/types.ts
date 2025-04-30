import type { LogLevel, LogContext } from './index';

declare global {
  namespace Express {
    interface Request {
      log(level: LogLevel, message: string, context?: LogContext): void;
    }
  }
}

export interface LogMetadata {
  timestamp: string;
  level: LogLevel;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
}

export interface ErrorLogMetadata extends LogMetadata {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
}