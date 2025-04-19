import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '@core/logging/config';

/**
 * Extract request ID from headers or generate new one
 */
const getRequestId = (req: Request): string => {
  return (
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-correlation-id'] as string) ||
    uuidv4()
  );
};

/**
 * Safely stringify query parameters
 */
const safeStringifyQuery = (query: Record<string, unknown>): string => {
  try {
    return JSON.stringify(query);
  } catch (error) {
    return '[Unable to stringify query]';
  }
};

/**
 * Get client IP address from request
 */
const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

/**
 * Request logging middleware
 * - Logs each request with timing and metadata
 * - Adds request ID to response headers
 * - Uses logfmt format for easy parsing
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Get or generate request ID
  const requestId = getRequestId(req);

  // Add request ID to response headers and request object
  res.setHeader('x-request-id', requestId);
  req.id = requestId;

  // Record start time
  const startTime = process.hrtime();

  // Log when response is finished
  res.on('finish', () => {
    // Calculate duration
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Log request details
    logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
      // Request identification
      request_id: requestId,
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      route: req.route?.path || 'unknown',
      routeStack: req.app._router.stack
        .filter((r: any) => r.route || r.name === 'router')
        .map((r: any) => ({
          path: r.route?.path || r.regexp?.toString(),
          methods: r.route?.methods || {}
        })),

      // Client information
      ip: getClientIp(req),
      user_agent: req.headers['user-agent'] || 'unknown',

      // Request details
      query: Object.keys(req.query).length > 0 ? safeStringifyQuery(req.query) : undefined,
      content_length: req.headers['content-length'],
      content_type: req.headers['content-type'],

      // Response details
      status_code: res.statusCode,
      status_message: res.statusMessage,
      content_length_sent: res.getHeader('content-length'),
      
      // Performance
      duration_ms: Math.round(duration),

      // Additional context
      referer: req.headers.referer || req.headers.referrer,
      protocol: req.protocol,
      secure: req.secure,
      xhr: req.xhr
    });
  });

  // Continue to next middleware
  next();
};