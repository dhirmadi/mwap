import mongoose from 'mongoose';
import environment from './environment';

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(environment.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB;