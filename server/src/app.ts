import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import compression from 'compression';
import environment from './config/environment';
import * as security from './middleware/security';
import { errorHandler } from './middleware/errors';
import routes from './routes';

// Custom error for application errors
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Types for response time middleware
interface ResponseWithTimer extends Response {
  startTime?: number;
}

// Types for static file options
interface StaticFileOptions {
  etag: boolean;
  lastModified: boolean;
  setHeaders: (res: Response, filePath: string) => void;
}

/**
 * Creates and configures an Express application instance
 * @returns Configured Express application
 */
export function createApp(): Application {
  const app = express();

  // Security setup (includes CORS, helmet, rate limiting)
  security.setupSecurity(app);

  // Response time middleware (after security, before routes)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Use high-resolution time for better accuracy
    const start = process.hrtime();

    // Function to calculate response time in milliseconds
    const getResponseTime = (): number => {
      const [seconds, nanoseconds] = process.hrtime(start);
      return Math.round((seconds * 1000) + (nanoseconds / 1000000));
    };

    // Function to set response time header
    const setResponseTime = () => {
      if (!res.headersSent) {
        const duration = getResponseTime();
        res.setHeader('X-Response-Time', `${duration}ms`);
      }
    };

    // Patch response methods to ensure timing is captured
    const methods = ['send', 'json', 'sendFile', 'sendStatus', 'end'];
    methods.forEach(method => {
      const original = (res as any)[method];
      (res as any)[method] = function(...args: any[]): Response {
        setResponseTime();
        return original.apply(res, args);
      };
    });

    // Handle various response completion scenarios
    res.on('finish', setResponseTime);
    res.on('close', setResponseTime);
    res.on('error', setResponseTime);

    // Handle errors in error middleware
    const originalEmit = res.emit;
    res.emit = function(type: string, ...args: any[]): boolean {
      if (type === 'error' || type === 'timeout') {
        setResponseTime();
      }
      return originalEmit.call(res, type, ...args);
    };

    next();
  });

  // Compression middleware
  app.use(compression());

  // Body parsing middleware with size limits
  app.use(express.json({ 
    limit: '10kb',
    strict: true // Enforce strict JSON parsing
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10kb'
  }));

  // Health check endpoint (no auth required)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      environment: environment.getEnvironmentName(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API Routes
  app.use('/api', routes);

  // Static file serving in non-development environments
  if (!environment.isDevelopment()) {
    const staticOptions: StaticFileOptions = {
      etag: true,
      lastModified: true,
      setHeaders: (res: Response, filePath: string) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else {
          res.setHeader('Cache-Control', 'max-age=31536000');
        }
      }
    };

    const clientPath = path.join(__dirname, '../../client/dist');
    
    // Serve static files
    app.use(express.static(clientPath, staticOptions));

    // SPA fallback route
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }

      const indexPath = path.join(clientPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          next(new AppError(500, 'Error loading application'));
        }
      });
    });
  }

  // 404 handler for API routes
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(404, 'API endpoint not found');
    next(error);
  });

  // 404 handler for all other routes in production
  if (!environment.isDevelopment()) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const error = new AppError(404, 'Page not found');
      next(error);
    });
  }

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

// Export a singleton instance for direct use
export const app = createApp();