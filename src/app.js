const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const { connectDB } = require('./config/database');
const encryption = require('./config/encryption');
require('dotenv').config();

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log')
    })
  ]
});

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic health check endpoint - detailed monitoring available in Atlas
app.get('/health', (req, res) => {
  res.json({ 
    status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  });
});

// MongoDB status endpoint
app.get('/api/status', (req, res) => {
  const conn = mongoose.connection;
  res.json({
    connectionState: conn.readyState,
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0',
    host: conn.host || 'Not connected',
    database: conn.name || 'Not connected',
    message: conn.readyState === 1 ? 'Connected to MongoDB' : 'Not connected to MongoDB'
  });
});

// Import routes
const itemRoutes = require('./routes/items');

// Use routes
app.use('/api/items', itemRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MWAP Microservice API',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred'
        : err.message,
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize database encryption
    await encryption.initialize(process.env.MONGO_URI);
    logger.info('Database encryption initialized');

    // Connect to MongoDB
    await connectDB();
    logger.info('Database connection established');

    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  try {
    logger.info('Received shutdown signal');
    
    // Close database encryption client
    await encryption.close();
    logger.info('Closed encryption client');
    
    // Close MongoDB connection (handled in database.js)
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;