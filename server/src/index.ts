import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { connectDB } from '@core/config/database';
import { env } from '@core/config/environment';
import { app } from './app';
import { Server } from 'http';
import { logger } from '@core/utils/logger';
import { errorHandler, notFoundHandler } from '@core/middleware/error';

// Add response time header
app.use((req: Request, res: Response, next: NextFunction) => {
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

// Serve static files in all non-development environments with caching
if (!env.isDevelopment()) {
  const staticOptions = {
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

  // Serve index.html for all routes (SPA)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
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

// Handle 404s
app.use(notFoundHandler);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => errorHandler(err, req, res, next));

let server: Server;

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Starting graceful shutdown...');
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Connect to database
connectDB();

// Start server
server = app.listen(env.server.port, () => {
  logger.info('Server started', {
    port: env.server.port,
    environment: env.getEnvironmentName(),
    routes: app._router.stack
      .filter((r: any) => r.route || r.name === 'router')
      .map((r: any) => ({
        path: r.route?.path || r.regexp?.toString(),
        methods: r.route?.methods || {}
      }))
  });
});