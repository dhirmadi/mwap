import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import { setupSecurity } from '@core/middleware/security';
import { errorHandler, notFoundHandler } from '@core/middleware/error';
import { requestLogger } from '@core/middleware/request-logger';
import { v1Router } from './routes/v1';
import { createRouter } from '@core/types/router';
import { logger } from '@core/utils/logger';

const app = express();

// Security setup (includes CORS, helmet, rate limiting)
setupSecurity(app);

// Request logging
app.use(requestLogger);

// Compression middleware
app.use(compression());

// Body parsing middleware with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'present' : 'missing',
      'user-agent': req.headers['user-agent']
    },
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
});

// API Routes (versioned)
app.use('/api', (req, res, next) => {
  logger.info('API request received', {
    method: req.method,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
}, v1Router);

// Handle 404s
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

export { app };