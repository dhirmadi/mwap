import mongoose from 'mongoose';

// Global connection state
let dbConnection: mongoose.Connection | null = null;
let dbName: string = '';

/**
 * Get a test database connection
 */
async function getConnection(): Promise<mongoose.Connection> {
  // If we have a valid connection, return it
  if (dbConnection?.readyState === 1) {
    return dbConnection;
  }

  // Close any existing connection
  if (dbConnection) {
    try {
      await dbConnection.close(true);
    } catch (error) {
      console.warn('Error closing existing connection:', error);
    }
    dbConnection = null;
  }

  // Generate unique database name
  dbName = 'test_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  
  // Use test database URL or default test connection
  const testDbUrl = process.env.TEST_MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017';
  
  // Create new connection with retry logic
  let retries = 3;
  while (retries > 0) {
    try {
      dbConnection = await mongoose.createConnection(`${testDbUrl}/${dbName}`, {
        autoCreate: true,
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        family: 4, // Force IPv4
      });

      // Wait for connection to be ready
      await new Promise<void>((resolve, reject) => {
        if (dbConnection?.readyState === 1) {
          resolve();
        } else {
          dbConnection?.once('connected', resolve);
          dbConnection?.once('error', reject);
        }
      });

      return dbConnection;
    } catch (error) {
      console.warn(`Failed to connect, retries left: ${retries - 1}`, error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Failed to connect to database after retries');
}

/**
 * Connect to test database
 */
export async function connectTestDb(): Promise<void> {
  try {
    const conn = await getConnection();
    (mongoose as any).connection = conn;
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
  try {
    const conn = await getConnection();
    if (!conn) {
      console.warn('No connection available to clear');
      return;
    }

    const collections = await conn.db!.collections();
    
    // Drop each collection
    await Promise.all(collections.map(async (collection) => {
      try {
        await collection.deleteMany({});
        console.log(`Cleared collection: ${collection.collectionName}`);
      } catch (error) {
        console.error(`Error clearing collection ${collection.collectionName}:`, error);
        throw error;
      }
    }));
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Drop test database and close connection
 */
export async function closeTestDb(): Promise<void> {
  if (!dbConnection) {
    return;
  }

  try {
    // Drop database first
    if (dbConnection.readyState === 1) {
      await dbConnection.dropDatabase();
      console.log('Dropped test database:', dbName);
    }

    // Close connection
    await dbConnection.close(true);
    dbConnection = null;
    console.log('Closed database connection');
  } catch (error) {
    console.error('Error closing database connection:', error);
    // Don't throw here, just log the error
  } finally {
    // Ensure connection is nulled even if there's an error
    dbConnection = null;
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
    // Try to reconnect if we lost connection
    if ((error as Error).message?.includes('Connection was force closed')) {
      await getConnection();
    }
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return dbConnection?.readyState === 1;
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
  const conn = await getConnection();
  const collections = await conn.db!.collections();
  return collections.map(c => c.collectionName);
}
