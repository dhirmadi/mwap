const mongoose = require('mongoose');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/database-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/database.log' })
  ]
});

// MongoDB connection options
const mongooseOptions = {
  autoIndex: process.env.NODE_ENV !== 'production', // Disable autoIndex in production
  serverSelectionTimeoutMS: 5000, // Keep trying for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 2
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

module.exports = {
  connectDB,
  mongooseOptions // Export for testing purposes
};