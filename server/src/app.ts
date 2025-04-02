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

  // Response time middleware
  app.use((req: Request, res: ResponseWithTimer, next: NextFunction) => {
    res.startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - (res.startTime || Date.now());
      try {
        res.set('X-Response-Time', `${duration}ms`);
      } catch (error) {
        // Headers already sent, ignore
      }
    });
    next();
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

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

// Export a singleton instance for direct use
export const app = createApp();