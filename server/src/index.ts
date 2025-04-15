import 'dotenv/config';
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import path from 'path';
import compression from 'compression';
import { connectDB } from './config/db';
import { env } from './config/environment';
import { setupSecurity } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { Server } from 'http';

const app = express();

// Security setup (includes CORS, helmet, rate limiting)
setupSecurity(app);

// Compression middleware
app.use(compression());

// Body parsing middleware with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check endpoint (no auth required)
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    environment: env.getEnvironmentName(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes with response time header
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

app.use('/api', routes);

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
app.use(errorHandler);

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
  console.log(`Server running on port ${env.server.port} (${env.getEnvironmentName()})`);
  
  if (env.isDevelopment()) {
    console.log('Configuration:', {
      environment: env.getEnvironmentName(),
      port: env.server.port,
      mongoDb: 'Connected',
      auth0Domain: env.auth0.domain,
      corsOrigin: env.security.corsOrigin,
    });
  }
});