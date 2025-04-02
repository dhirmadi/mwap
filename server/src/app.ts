import 'dotenv/config';
import express, { Application } from 'express';
import path from 'path';
import compression from 'compression';
import environment from './config/environment';
import { setupSecurity } from './middleware/security';
import { errorHandler } from './middleware/errors';
import routes from './routes';

export function createApp(): Application {
  const app = express();

  // Security setup (includes CORS, helmet, rate limiting)
  setupSecurity(app);

  // Compression middleware
  app.use(compression());

  // Body parsing middleware with size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Health check endpoint (no auth required)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      environment: environment.getEnvironmentName(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API Routes with response time header
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      try {
        res.set('X-Response-Time', `${duration}ms`);
      } catch (error) {
        // Ignore header errors after response is sent
      }
    });
    next();
  });

  app.use('/api', routes);

  // Serve static files in all non-development environments with caching
  if (!environment.isDevelopment()) {
    const staticOptions = {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath: string) => {
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

    // Serve index.html for all routes (SPA)
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientPath, 'index.html'), (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          res.status(500).send('Error loading application');
        }
      });
    });
  }

  // Error handling
  app.use(errorHandler);

  return app;
}

// Export a singleton instance for direct use
export const app = createApp();