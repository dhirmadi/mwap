import { app } from '../../app';
import request from 'supertest';
import mongoose from 'mongoose';

// Create a type-safe test client
export type TestClient = request.SuperTest<request.Test>;

export function createTestClient(): TestClient {
  return request(app);
}

// Database handling
export async function connectTestDb(): Promise<void> {
  try {
    // Use test database URL or in-memory MongoDB
    const testDbUrl = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(testDbUrl);
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
}

export async function clearTestDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    await Promise.all(
      Object.values(collections).map((collection) => collection.deleteMany({}))
    );
  }
}

export async function disconnectTestDb(): Promise<void> {
  await mongoose.disconnect();
}