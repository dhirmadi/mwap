const mongoose = require('mongoose');
const environment = require('./environment');

const connectDB = async () => {
  // Skip MongoDB connection in development
  if (environment.isDevelopment()) {
    console.log('Skipping MongoDB connection in development mode');
    return;
  }

  try {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    // Initialize models
    const User = require('../models/User');
    const Task = require('../models/Task');
    
    // Create indexes if models are Mongoose models
    if (process.env.NODE_ENV !== 'development') {
      if (User.createIndexes) {
        await User.createIndexes();
      }
      if (Task.createIndexes) {
        await Task.createIndexes();
      }
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    if (!environment.isDevelopment()) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;