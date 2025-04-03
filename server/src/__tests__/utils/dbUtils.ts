import mongoose from 'mongoose';

// Global connection state
let dbName: string = '';

/**
 * Connect to test database
 */
export async function connectTestDb(): Promise<void> {
  try {
    // Generate unique database name for this test run
    dbName = 'test_' + Date.now() + '_' + Math.random().toString(36).substring(7);
    
    // Use test database URL or default test connection
    const testDbUrl = process.env.TEST_MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017';
    
    // Connect to database
    await mongoose.connect(`${testDbUrl}/${dbName}`, {
      autoCreate: true,
      autoIndex: true,
    });

    console.log('Connected to test database:', dbName);
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
}

/**
 * Drop all collections in the test database
 */
export async function clearDatabase(): Promise<void> {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    console.log('No connection to clear');
    return;
  }

  try {
    const collections = await mongoose.connection.db.collections();
    
    // Drop each collection
    for (const collection of collections) {
      try {
        await collection.deleteMany({});
        console.log(`Cleared collection: ${collection.collectionName}`);
      } catch (error) {
        console.error(`Error clearing collection ${collection.collectionName}:`, error);
      }
    }
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

/**
 * Drop test database and close connection
 */
export async function closeTestDb(): Promise<void> {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    console.log('No connection to close');
    return;
  }

  try {
    // Drop database first
    await mongoose.connection.dropDatabase();
    console.log('Dropped test database:', dbName);

    // Close connection
    await mongoose.disconnect();
    console.log('Closed database connection');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

/**
 * Reset database to a clean state
 */
export async function resetDatabase(): Promise<void> {
  try {
    await clearDatabase();
    console.log('Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get current database name
 */
export function getDatabaseName(): string {
  return dbName;
}

/**
 * Get collection names
 */
export async function getCollectionNames(): Promise<string[]> {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return [];
  }
  const collections = await mongoose.connection.db.collections();
  return collections.map(c => c.collectionName);
}