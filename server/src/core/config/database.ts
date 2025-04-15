import mongoose, { ConnectOptions } from 'mongoose';
import { env } from './environment';

interface ExtendedConnectOptions extends ConnectOptions {
  maxPoolSize?: number;
  minPoolSize?: number;
  socketTimeoutMS?: number;
  serverSelectionTimeoutMS?: number;
  family?: number;
  retryWrites?: boolean;
  ssl?: boolean;
  authSource?: string;
}

export const connectDB = async (): Promise<void> => {
  try {
    const options: ExtendedConnectOptions = {
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

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
      if (!env.isDevelopment()) {
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
    if (!env.isDevelopment()) {
      process.exit(1);
    }
  }
};