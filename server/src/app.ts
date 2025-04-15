import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import { setupSecurity } from '@core/middleware/security';
import { errorHandler, notFoundHandler } from '@core/middleware/error';
import { requestLogger } from '@core/middleware/request-logger';
import { routes } from '@core/routes';

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

// API Routes
app.use('/api/v1', routes);

// Handle 404s
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

export { app };