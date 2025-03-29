const mongoose = require('mongoose');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/database-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/database.log' 
    })
  ]
});

// MongoDB connection options
const mongooseOptions = {
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 2,
  connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS) || 30000,
  socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB with retries
const connectDB = async (retries = 5) => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    logger.info(`Attempting to connect to MongoDB (${retries} retries left)`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.info('Mongoose disconnected from MongoDB');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    
    if (retries > 0) {
      logger.info(`Retrying connection in 5 seconds... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    } else {
      logger.error('Failed to connect to MongoDB after all retries');
      throw error;
    }
  }
};

// Get database status
const getDatabaseStatus = async () => {
  try {
    const status = {
      connected: mongoose.connection.readyState === 1,
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || 'Not connected',
      database: mongoose.connection.name || 'Not connected',
      port: mongoose.connection.port || 'Not connected',
      timestamp: new Date().toISOString()
    };

    if (status.connected) {
      // Add additional stats if connected
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      status.connections = serverStatus.connections;
      status.opcounters = serverStatus.opcounters;
      status.uptime = serverStatus.uptime;
    }

    return status;
  } catch (error) {
    logger.error('Error getting database status:', error);
    return {
      connected: false,
      state: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  connectDB,
  getDatabaseStatus,
  mongooseOptions
};