const mongoose = require('mongoose');
const environment = require('./environment');

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      authSource: 'admin'
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize models
    const User = require('../models/UserSchema');
    const Task = require('../models/Task');
    
    // Create indexes if models are Mongoose models and we're not in development
    if (!environment.isDevelopment()) {
      try {
        if (typeof User.createIndexes === 'function') {
          await User.createIndexes();
          console.log('User indexes created successfully');
        }
        if (typeof Task.createIndexes === 'function') {
          await Task.createIndexes();
          console.log('Task indexes created successfully');
        }
      } catch (indexError) {
        console.warn('Error creating indexes:', indexError);
        // Don't fail the connection if indexes can't be created
      }
    }
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      if (!environment.isDevelopment()) {
        process.exit(1);
      }
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