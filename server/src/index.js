require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const connectDB = require('./config/db');
const env = require('./config/environment');
const setupSecurity = require('./middleware/security');
const { errorHandler } = require('./middleware/errors');
const routes = require('./routes').default;

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
    environment: env.getEnvironmentName(),
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
if (!env.isDevelopment()) {
  const staticOptions = {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
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

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Starting graceful shutdown...');
  server.close(async () => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Connect to database
connectDB();

// Start server
const server = app.listen(env.server.port, () => {
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
